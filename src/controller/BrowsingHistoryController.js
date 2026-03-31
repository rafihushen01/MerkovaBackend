const BrowsingHistory = require("../models/BrowsingHistory");

exports.recordBrowsing = async (req, res) => {
  try {
    const {
      userid,
      itemid,
      sessionid,
      viewDuration,
      scrollDepth,
      imageZooms,
      videoPlays,
      specsOpened,
      reviewsOpened
    } = req.body;

    // find if there's already a record
    let record = await BrowsingHistory.findOne({ userid, itemid });

    if (record) {
      record.totalViewCount += 1;
      record.lastViewedAt = new Date();
      record.totalViewDuration += viewDuration;

      // merge metrics
      record.scrollDepthAvg = ((record.scrollDepthAvg * (record.totalViewCount - 1)) + scrollDepth) / record.totalViewCount;
      record.imageZooms += imageZooms;
      record.videoPlays += videoPlays;
      record.specsOpened = record.specsOpened || specsOpened;
      record.reviewsOpened = record.reviewsOpened || reviewsOpened;
      record.sessionid = sessionid;

    } else {
      record = new BrowsingHistory({
        userid,
        itemid,
        sessionid,
        totalViewDuration: viewDuration,
        scrollDepthAvg: scrollDepth,
        imageZooms,
        videoPlays,
        specsOpened,
        reviewsOpened
      });
    }

    // compute attention score
    // You can improve this formula later, but this is strong now:
    record.attentionScore = (
      (record.totalViewCount * 2) +
      (record.totalViewDuration / 10) +
      (record.scrollDepthAvg / 10) +
      (record.imageZooms * 3) +
      (record.videoPlays * 5) +
      (record.specsOpened ? 8 : 0) +
      (record.reviewsOpened ? 10 : 0)
    );

    await record.save();

    return res.status(200).json({ success: true, data: record });

  } catch (error) {
    console.error("recordBrowsing error:", error);
    return res.status(500).json({ success: false, message: "Server error recording browsing." });
  }
};
exports.getBrowsingHistory = async (req, res) => {
  try {
    const { userid } = req.params; // user ID

    const history = await BrowsingHistory.find({ userid })
      .sort({ lastViewedAt: -1 }) // most recent first
      .limit(50) // recent 50
      .populate({
        path: "itemid",
        select: "title slug currentprice discountprice brand whiteimage"
      });

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });

  } catch (error) {
    console.error("getBrowsingHistory error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch browsing history."
    });
  }
};