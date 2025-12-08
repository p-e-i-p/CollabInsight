const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '请提供项目名称'],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['未开始', '进行中', '已完成'],
      default: '未开始',
    },
    priority: {
      type: String,
      enum: ['高', '中', '普通', '低'],
      default: '普通',
    },
    deadline: {
      type: Date,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', ProjectSchema);

