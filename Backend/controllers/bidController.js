import Bid from "../models/Bid.js";
import Wishlist from "../models/Wishlist.js";

// Create a new bid
export const createBid = async (req, res) => {
  try {
    const newBid = new Bid(req.body);
    await newBid.save();
    res.status(201).json(newBid);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all bids
export const getBids = async (req, res) => {
  try {
    const bids = await Bid.find().sort({ createdAt: -1 });
    res.json({ data: bids });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBidsByProductId = async (req, res) => {
  try {
    const bids = await Bid.find({ product: req.params.productId }).sort({
      createdAt: -1,
    }); // Newest first

    // console.log(bids, "<< bids");
    bids.length > 0
      ? res.json({ data: bids })
      : res.status(404).json({
          data: [],
          message: "Bid not found",
        });
  } catch (error) {
    res.status(400).json({ message: "Invalid product ID" });
  }
};

// Create a new Wishlist
export const createWishlist = async (req, res) => {
  try {
    const newWish = new Wishlist(req.body);
    await newWish.save();
    res.status(201).json({
      message: "Recored Created Successfully",
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get bids grouped by product, sorted by bidAmount, formatted for table
export const getBidsGroupedByProduct = async (req, res) => {
  try {
    // Aggregate pipeline to group by product and sort by bidAmount
    const groupedBids = await Bid.aggregate([
      {
        // Sort by bidAmount in descending order first
        $sort: { bidAmount: -1 },
      },
      {
        // Group by product
        $group: {
          _id: "$product",
          bids: {
            $push: {
              id: "$_id",
              name: "$name",
              email: "$email",
              bidAmount: "$bidAmount",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
            },
          },
          totalBids: { $sum: 1 },
          highestBid: { $max: "$bidAmount" },
          lowestBid: { $min: "$bidAmount" },
          averageBid: { $avg: "$bidAmount" },
        },
      },
      {
        // Sort products by highest bid amount
        $sort: { highestBid: -1 },
      },
      {
        // Format the output
        $project: {
          _id: 0,
          product: "$_id",
          bids: 1,
          totalBids: 1,
          highestBid: 1,
          lowestBid: 1,
          averageBid: { $round: ["$averageBid", 2] },
        },
      },
    ]);

    // Alternative format: Flat table structure
    const flatTableData = await Bid.find()
      .select("name email product bidAmount createdAt updatedAt")
      .sort({ product: 1, bidAmount: -1 })
      .lean();

    // Format for table display
    const tableData = flatTableData.map((bid, index) => ({
      sno: index + 1,
      name: bid.name,
      email: bid.email,
      product: bid.product,
      bidAmount: bid.bidAmount,
      bidDate: new Date(bid.createdAt).toLocaleDateString(),
      bidTime: new Date(bid.createdAt).toLocaleTimeString(),
    }));

    res.json({
      success: true,
      data: {
        grouped: groupedBids,
        table: tableData,
        summary: {
          totalProducts: groupedBids.length,
          totalBids: flatTableData.length,
          overallHighestBid: Math.max(...flatTableData.map((b) => b.bidAmount)),
          overallLowestBid: Math.min(...flatTableData.map((b) => b.bidAmount)),
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Get bids for a specific product sorted by bidAmount
export const getBidsByProduct = async (req, res) => {
  try {
    const { product } = req.params;

    const bids = await Bid.find({ product })
      .select("name email bidAmount createdAt updatedAt")
      .sort({ bidAmount: -1 })
      .lean();

    const tableData = bids.map((bid, index) => ({
      rank: index + 1,
      name: bid.name,
      email: bid.email,
      bidAmount: bid.bidAmount,
      bidDate: new Date(bid.createdAt).toLocaleDateString(),
      bidTime: new Date(bid.createdAt).toLocaleTimeString(),
    }));

    res.json({
      success: true,
      product,
      totalBids: bids.length,
      data: tableData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Get top bidders across all products
export const getTopBidders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topBidders = await Bid.aggregate([
      {
        $group: {
          _id: {
            name: "$name",
            email: "$email",
          },
          totalBids: { $sum: 1 },
          highestBid: { $max: "$bidAmount" },
          totalBidAmount: { $sum: "$bidAmount" },
          averageBid: { $avg: "$bidAmount" },
          products: { $addToSet: "$product" },
        },
      },
      {
        $sort: { highestBid: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 0,
          name: "$_id.name",
          email: "$_id.email",
          totalBids: 1,
          highestBid: 1,
          totalBidAmount: 1,
          averageBid: { $round: ["$averageBid", 2] },
          productsCount: { $size: "$products" },
          products: 1,
        },
      },
    ]);

    const tableData = topBidders.map((bidder, index) => ({
      rank: index + 1,
      name: bidder.name,
      email: bidder.email,
      totalBids: bidder.totalBids,
      highestBid: bidder.highestBid,
      totalBidAmount: bidder.totalBidAmount,
      averageBid: bidder.averageBid,
      productsCount: bidder.productsCount,
    }));

    res.json({
      success: true,
      data: tableData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
