const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const Project = require('../models/Project');
const Message = require('../models/Message');

const router = express.Router();

// 校验项目访问权限：仅项目成员/组长可查看消息
const ensureProjectAccess = async (projectId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return { allowed: false, reason: '项目 ID 无效' };
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return { allowed: false, reason: '项目不存在' };
  }

  const isLeader = project.leader.toString() === userId.toString();
  const isMember = project.members.map((m) => m.toString()).includes(userId.toString());

  if (!isLeader && !isMember) {
    return { allowed: false, reason: '无权限访问该项目' };
  }

  return { allowed: true, project };
};

// 获取某个项目的消息历史（按时间正序返回，默认最近 100 条）
router.get('/:projectId', protect, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const limit = Math.min(Number(req.query.limit) || 100, 200);

    const access = await ensureProjectAccess(projectId, userId);
    if (!access.allowed) {
      return res.status(403).json({ message: access.reason });
    }

    const messages = await Message.find({ project: projectId })
      .populate('sender', 'username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // 翻转为时间正序
    const ordered = messages.reverse().map((m) => ({
      id: m._id.toString(),
      projectId: m.project.toString(),
      senderId: m.sender?._id?.toString(),
      senderName: m.sender?.username || '未知用户',
      content: m.content,
      type: m.type,
      createdAt: m.createdAt,
    }));

    res.status(200).json({ code: 200, data: ordered });
  } catch (error) {
    console.error('获取项目消息失败', error);
    res.status(500).json({ message: error.message || '获取项目消息失败' });
  }
});

module.exports = router;





