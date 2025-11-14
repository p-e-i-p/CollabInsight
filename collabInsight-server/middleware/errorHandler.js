const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  console.error(err);

  // Mongoose 错误处理
  // 重复字段错误
  if (err.code === 11000) {
    const message = `重复的字段值: ${Object.keys(err.keyValue)}`;
    error = { message, statusCode: 400 };
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // Mongoose CastError (无效ID)
  if (err.name === 'CastError') {
    const message = '资源未找到';
    error = { message, statusCode: 404 };
  }

  res.status(error.statusCode || 500).json({
    code: error.statusCode || 500,
    message: error.message || '服务器错误'
  });
};

module.exports = errorHandler;
