import Product from "../models/Product.js";
import Wishlist from "../models/Wishlist.js";
import { transporter } from "../config/email.js";

export const getProducts = async (req, res) => {
  // Extract all possible query parameters
  const {
    category,
    limit,
    sort,
    minPrice,
    maxPrice,
    inStock, // boolean
    search, // text search
    auctionStatus, // 'active', 'expired', or 'all'
  } = req.query;

  // Build the query object dynamically
  const query = {};

  if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (inStock === "true") {
    query.stockQuantity = { $gt: 0 };
  }

  // Filter by auction end date status
  if (auctionStatus && auctionStatus !== "all") {
    // Only apply filter to records that have auction fields
    const auctionQuery = {
      endDate: { $exists: true },
      endHour: { $exists: true },
      endMinute: { $exists: true },
    };

    if (auctionStatus === "active") {
      // Show only auctions that haven't ended yet
      auctionQuery.$expr = {
        $gt: [
          {
            $dateFromString: {
              dateString: {
                $concat: [
                  "$endDate",
                  "T",
                  {
                    $cond: [
                      { $lt: [{ $toInt: "$endHour" }, 10] },
                      { $concat: ["0", "$endHour"] },
                      "$endHour",
                    ],
                  },
                  ":",
                  {
                    $cond: [
                      { $lt: [{ $toInt: "$endMinute" }, 10] },
                      { $concat: ["0", "$endMinute"] },
                      "$endMinute",
                    ],
                  },
                  ":00.000Z",
                ],
              },
            },
          },
          new Date(),
        ],
      };
    } else if (auctionStatus === "expired") {
      // Show only auctions that have ended
      auctionQuery.$expr = {
        $lte: [
          {
            $dateFromString: {
              dateString: {
                $concat: [
                  "$endDate",
                  "T",
                  {
                    $cond: [
                      { $lt: [{ $toInt: "$endHour" }, 10] },
                      { $concat: ["0", "$endHour"] },
                      "$endHour",
                    ],
                  },
                  ":",
                  {
                    $cond: [
                      { $lt: [{ $toInt: "$endMinute" }, 10] },
                      { $concat: ["0", "$endMinute"] },
                      "$endMinute",
                    ],
                  },
                  ":00.000Z",
                ],
              },
            },
          },
          new Date(),
        ],
      };
    }

    Object.assign(query, auctionQuery);
  }

  // Build the options object for sorting and limiting
  const options = {};

  if (sort) {
    options.sort = sort.split(",").join(" "); // Converts "price,-rating" to "price -rating"
  }

  if (limit) {
    options.limit = Number(limit);
  }

  // Text search (requires text index in MongoDB)
  if (search) {
    query.$text = { $search: search };
  }

  try {
    // Execute the query with all conditions
    const products = await Product.find(query, null, options);

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product
      ? res.json(product)
      : res.status(404).json({ message: "Product not found" });
  } catch (error) {
    res.status(400).json({ message: "Invalid product ID" });
  }
};

export const createProduct = async (req, res) => {
  const newProduct = new Product(req.body);
  const savedProduct = await newProduct.save();
  res.status(201).json(savedProduct);
};

export const getCategoryCounters = async (req, res) => {
  try {
    const categoryCounters = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get total count
    const totalCount = await Product.countDocuments();

    // Format response
    const counters = {
      total: totalCount,
      categories: {},
    };

    // Convert array to object format
    categoryCounters.forEach((item) => {
      counters.categories[item._id || "Uncategorized"] = item.count;
    });

    res.json({
      success: true,
      data: counters,
    });
  } catch (error) {
    console.error("Error fetching category counters:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const processWishlistAndSendEmails = async (productId) => {
  try {
    // 1. Find all wishlist entries for specific product
    const wishlistEntries = await Wishlist.find({ product: productId });

    if (wishlistEntries.length === 0) {
      console.log("No wishlist entries found for this product");
      return;
    }

    // 2. Extract emails and remove duplicates
    const allEmails = wishlistEntries.map((entry) => entry.email);
    const uniqueEmails = [...new Set(allEmails)];

    console.log(
      `Found ${allEmails.length} total entries, ${uniqueEmails.length} unique emails`
    );

    // 3. Get product details
    const product = await Product.findById(productId);

    if (!product) {
      console.log("Product not found for email notifications");
      return;
    }

    // 4. Send email to each unique email
    const emailPromises = uniqueEmails.map(async (email) => {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Product Update - Your Wishlist Item",
          html: `
            <h3>Wishlist Notification</h3>
            <p>Hi there!</p>
            <p>Your wishlist item has been updated and bidding time will end soon:</p>
            <p><strong>Product:</strong> ${product?.title || "Product"}</p>
            <p>
              <strong>Product Link:</strong>
              <a href="${process.env.CORS_ORIGIN}/detail/${
            product?._id
          }" target="_blank">
                ${product?.title || "Product"} Link
              </a> 
            </p>
            <p><strong>End Date:</strong> ${
              product?.endDate || "01-01-1997"
            }</p>
            <p><strong>End Time:</strong> ${product?.endHour || "00"}:${
            product?.endMinute || "00"
          }</p>
            <p><strong>Price:</strong> $${product?.price || "N/A"}</p>
            <p>Thank you for your interest!</p>
          `,
        });
        console.log(`Email sent to: ${email}`);
        await Wishlist.deleteMany({ email, product: productId });
        return { email, status: "sent" };
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return { email, status: "failed", error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);

    return {
      totalEntries: allEmails.length,
      uniqueEmails: uniqueEmails.length,
      emailResults: results,
    };
  } catch (error) {
    console.error("Error processing wishlist:", error);
    throw error;
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Send response IMMEDIATELY to frontend
    res.json(product);

    // Process emails in BACKGROUND (don't await)
    if (req.body.endDate) {
      processWishlistAndSendEmails(req.params.id)
        .then((result) => {
          console.log("Emails sent successfully:", result);
        })
        .catch((emailError) => {
          console.error("Email sending failed:", emailError);
        });
    }
  } catch (error) {
    res.status(400).json({ message: "Invalid update" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    product
      ? res.json({ message: "Product deleted" })
      : res.status(404).json({ message: "Product not found" });
  } catch (error) {
    res.status(400).json({ message: "Invalid delete" });
  }
};
