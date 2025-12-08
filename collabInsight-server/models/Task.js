const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    taskName: {
      type: String,
      required: [true, '请提供任务名称'],
      trim: true,
      maxlength: 100,
    },
    taskDetails: {
      type: String,
      default: '',
      maxlength: 500,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    urgency: {
      type: String,
      enum: ['高', '中', '普通'],
      default: '普通',
    },
    startDate: {
      type: Date,
    },
    deadline: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);

