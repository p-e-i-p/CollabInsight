
const express = require('express');
const bugController = require('../controllers/bugController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

// 获取项目下的Bug列表
router.get('/:projectId', bugController.getBugsByProject);

// 创建Bug
router.post('/:projectId', bugController.createBug);

// 更新Bug
router.put('/:bugId', bugController.updateBug);

// 删除Bug
router.delete('/:bugId', bugController.deleteBug);

// 组长审核Bug
router.post('/:bugId/approve', bugController.approveBug);

// 组长搜索用户，用于分配Bug
router.get('/:projectId/searchUser', bugController.searchUserForBug);

module.exports = router;
