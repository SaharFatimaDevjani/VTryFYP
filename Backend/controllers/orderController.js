import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

async function restockOrderItems(order, session) {
  const items = order?.items || [];
  if (!items.length) return;

  const ops = items.map((it) => ({
    updateOne: {
      filter: { _id: it.product },
      update: { $inc: { stockQuantity: Number(it.qty || 0) } },
    },
  }));

  await Product.bulkWrite(ops, { session });
}

async function deductStockForItems(items, session) {
  const productIds = items.map((it) => it.product);
  const products = await Product.find({ _id: { $in: productIds } }).session(session);

  const map = new Map(products.map((p) => [String(p._id), p]));

  let total = 0;

  const populatedItems = items.map((it) => {
    const prod = map.get(String(it.product));
    if (!prod) throw new Error(`Product not found: ${it.product}`);

    const qty = Number(it.qty || 1);
    if (qty <= 0) throw new Error("Invalid qty");

    const available = Number(prod.stockQuantity || 0);
    if (available < qty) {
      throw new Error(`Not enough stock for ${prod.title}. Available: ${available}, Required: ${qty}`);
    }

    const price = Number(prod.price || 0);
    total += price * qty;

    return {
      product: prod._id,
      title: prod.title,
      qty,
      price,
    };
  });

  // bulk deduct
  const ops = populatedItems.map((it) => ({
    updateOne: {
      filter: { _id: it.product },
      update: { $inc: { stockQuantity: -Number(it.qty || 0) } },
    },
  }));

  await Product.bulkWrite(ops, { session });

  return { populatedItems, total };
}

// ✅ LOGGED-IN order
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "No order items" });
    }

    const { populatedItems, total } = await deductStockForItems(items, session);

    const order = new Order({
      user: req.user._id,
      items: populatedItems,
      totalAmount: total,
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || "COD",
    });

    const saved = await order.save({ session });

    await session.commitTransaction();

    const populated = await Order.findById(saved._id).populate("user", "first_name last_name email phone");
    res.status(201).json(populated);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

// ✅ GUEST order
export const createGuestOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress, paymentMethod, guest } = req.body;

    if (!guest?.fullName || !guest?.email || !guest?.phone) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Guest fullName, email, phone are required." });
    }

    if (
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.country
    ) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Shipping address fields are required." });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "No order items" });
    }

    const { populatedItems, total } = await deductStockForItems(items, session);

    const order = new Order({
      user: undefined,
      guest: {
        fullName: guest.fullName,
        email: guest.email.toLowerCase(),
        phone: guest.phone,
      },
      items: populatedItems,
      totalAmount: total,
      shippingAddress: {
        ...shippingAddress,
        fullName: shippingAddress.fullName || guest.fullName,
        phone: shippingAddress.phone || guest.phone,
      },
      paymentMethod: paymentMethod || "COD",
    });

    const saved = await order.save({ session });

    await session.commitTransaction();

    res.status(201).json(saved);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

export const getOrders = async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const orders = await Order.find({})
        .populate("user", "first_name last_name email phone")
        .sort({ createdAt: -1 });
      return res.json(orders);
    }

    const orders = await Order.find({ user: req.user._id })
      .populate("user", "first_name last_name email phone")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "first_name last_name email phone");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!req.user.isAdmin && String(order.user?._id) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch {
    res.status(400).json({ message: "Invalid order id" });
  }
};

// admin status update + restock when set to cancelled
export const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user.isAdmin) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    const prev = order.status;
    order.status = status;

    if (prev !== "cancelled" && status === "cancelled") {
      await restockOrderItems(order, session);
    }

    await order.save({ session });
    await session.commitTransaction();

    const populated = await Order.findById(order._id).populate("user", "first_name last_name email phone");
    res.json(populated);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

// user cancel pending + restock (admin can also cancel pending)
export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    const isOwner = order.user && String(order.user) === String(req.user._id);
    if (!isOwner && !req.user.isAdmin) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    order.status = "cancelled";
    await restockOrderItems(order, session);

    await order.save({ session });
    await session.commitTransaction();

    const populated = await Order.findById(order._id).populate("user", "first_name last_name email phone");
    res.json(populated);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};
