import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Create a new order (protected)
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Validate products and compute total
    let total = 0;
    const populatedItems = await Promise.all(
      items.map(async (it) => {
        const prod = await Product.findById(it.product);
        if (!prod) throw new Error(`Product not found: ${it.product}`);
        const price = prod.price || it.price || 0;
        const qty = it.qty ? Number(it.qty) : 1;
        total += price * qty;
        return {
          product: prod._id,
          title: prod.title,
          qty,
          price,
        };
      })
    );

    const order = new Order({
      user: req.user._id,
      items: populatedItems,
      totalAmount: total,
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || "unknown",
    });

    const saved = await order.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get orders for current user (or all if admin)
export const getOrders = async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const orders = await Order.find()
        .populate("user", "-password")
        .sort({ createdAt: -1 });
      return res.json(orders);
    }
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order by id (protected) - only owner or admin
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "-password"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!req.user.isAdmin && String(order.user._id) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: "Invalid order id" });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    if (!req.user.isAdmin)
      return res.status(403).json({ message: "Admin access required" });
    const { status } = req.body;
    const allowed = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid status" });
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel order (user can cancel if pending)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (String(order.user) !== String(req.user._id) && !req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }
    if (order.status !== "pending")
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled" });
    order.status = "cancelled";
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
