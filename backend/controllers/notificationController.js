import Notification from "../models/notificationModel.js";
export const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });
    await Notification.updateMany({ to: userId }, { $set: { read: true } });
    res.status(200).json(notifications);
  } catch (error) {
    console.log(`getting error at notification:${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log(`getting error at notification:${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
