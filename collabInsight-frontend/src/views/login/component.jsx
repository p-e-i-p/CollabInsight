

export const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<LoginFormValues>(); // 初始化 Form 实例，绑定类型

  // 3. 登录提交逻辑
  const handleLogin = async (values: LoginFormValues) => {
    try {
      // 模拟登录请求（后续替换为真实接口调用）
      if (values.username && values.password) {
        localStorage.setItem('token', 'fake-token-123'); // 存储登录状态
        message.success('登录成功！即将跳转到首页');
        navigate('/'); // 登录成功跳转到首页
      } else {
        message.error('请输入完整的用户名和密码');
      }
    } catch (error) {
      message.error('登录失败，请重试');
      console.error('登录错误：', error);
    }
  };

  return (
    // 4. 外层容器：全屏背景图 + 居中布局（修正 Tailwind 类）
    <div className="min-h-screen flex items-center justify-center p-4 bg-login">
      {/* 5. 登录卡片：替代自定义 div，优化样式和兼容性 */}
      <Card
        className="w-full max-w-md shadow-xl bg-white/95 backdrop-blur-sm border-0"
        bordered={false}
      >
        {/* 6. AntD Form 正确用法：绑定 form 实例 + 配置提交逻辑 */}
        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
          initialValues={{ username: 'admin' }} // 默认填充用户名
          className="space-y-6" // 表单字段间距
        >
          {/* 标题 */}
          <div className="text-center text-2xl font-bold text-gray-800 mb-4">账号登录</div>

          {/* 用户名输入框 */}
          <Form.Item<LoginFormValues>
            name="username" // 字段名必须和 LoginFormValues 一致
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名！' }, // 必填校验
              { min: 3, message: '用户名长度不能少于 3 位' } // 可选：长度校验
            ]}
          >
            <Input
              placeholder="请输入用户名"
              size="large"
              className="rounded-lg" // 统一圆角
            />
          </Form.Item>

          {/* 密码输入框 */}
          <Form.Item<LoginFormValues>
            name="password" // 字段名必须和 LoginFormValues 一致
            label="密码"
            rules={[
              { required: true, message: '请输入密码！' }, // 必填校验
              { min: 6, message: '密码长度不能少于 6 位' } // 可选：长度校验
            ]}
          >
            <Input.Password // 密码框：隐藏输入内容
              placeholder="请输入密码"
              size="large"
              className="rounded-lg" // 统一圆角
            />
          </Form.Item>

          {/* 登录按钮 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="w-full h-12 text-lg rounded-lg"
              style={{ backgroundColor: '#1890ff' }} // 匹配主色调
            >
              登录
            </Button>
          </Form.Item>

          {/* 忘记密码 + 注册账号（横向布局） */}
          <div className="flex justify-center gap-8 mt-2">
            <Button type="link" className="text-indigo-500">
              忘记密码
            </Button>
            <Button type="link" className="text-indigo-500">
              注册新账号
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};