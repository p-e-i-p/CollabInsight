

const mongoose = require('mongoose');

const BugSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Bug必须属于一个项目'],
    },
    bugName: {
      type: String,
      required: [true, '请提供Bug名称'],
      trim: true,
      maxlength: [100, 'Bug名称不能超过100个字符'],
    },
    bugDetails: {
      type: String,
      default: '',
      maxlength: [500, 'Bug详情不能超过500个字符'],
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '请指定Bug处理人'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '请指定Bug创建人'],
    },
    severity: {
      type: String,
      enum: ['严重', '高', '中', '低'],
      default: '中',
      required: [true, '请指定Bug严重程度'],
    },
    status: {
      type: String,
      enum: ['待处理', '处理中', '待审核', '已解决', '已关闭', '已取消'],
      default: '待处理',
      required: [true, '请指定Bug状态'],
    },
    solution: {
      type: String,
      default: '',
      maxlength: [500, '解决方案不能超过500个字符'],
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
    approvalStatus: {
      type: String,
      enum: ['待审核', '通过', '不通过'],
      default: '待审核',
      required: [true, '请指定审核状态'],
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewComment: {
      type: String,
      default: '',
      maxlength: [200, '审核意见不能超过200个字符'],
    },
    reviewedAt: {
      type: Date,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
    },
  },
  { timestamps: true }
);

// 添加索引以提高查询性能
BugSchema.index({ project: 1, status: 1 });
BugSchema.index({ assignee: 1, status: 1 });
BugSchema.index({ createdBy: 1, createdAt: -1 });

// 状态变更时自动更新相关字段
BugSchema.pre('save', function(next) {
  // 状态变更为"已解决"时，记录解决人和解决时间
  if (this.isModified('status') && this.status === '已解决' && this.status !== this.originalStatus) {
    this.resolvedBy = this.updatedBy || this.createdBy;
    this.resolvedAt = new Date();
  }

  // 状态变更为"待审核"时，重置审核状态
  if (this.isModified('status') && this.status === '待审核' && this.status !== this.originalStatus) {
    this.approvalStatus = '待审核';
    this.reviewer = undefined;
    this.reviewComment = '';
    this.reviewedAt = undefined;
  }

  next();
});

module.exports = mongoose.model('Bug', BugSchema);

