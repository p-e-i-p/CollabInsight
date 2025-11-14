import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Input, Card, message } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import { register } from '@/api/register';
import type { RegisterParams } from '@/api/register';
import type { LoginParams } from '@/api/login/type';

export const Register = () => {
  const [RegisterFrom] = Form.useForm<RegisterParams>();
  const navigate = useNavigate();
  const [loading, setloading] = useState(false);

  const handelRegister = async (values: RegisterParams) => {
    console.log(values);
    try {
      setloading(true);
      const res = await register(values);
      message.success('注册成功，请登录');
      navigate('/login');
    } catch (error) {
      console.log(error);
      message.error('注册失败，请重试');
    } finally {
      setloading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-8 items-center justify-stretch p-4 md:p-8 bg-login">
      <div className="hidden md:block col-span-5"></div>
      {/* 注册 */}
      <Card className=" col-span-1  text-center  shadow-xl rounded-lg border-2 backdrop-blur-sm bg-white/95 max-w-[90vw] w-[370px] h-[450px] ">
        <Form form={RegisterFrom} onFinish={handelRegister}>
          <div className="text-xl pb-4 my-3">账号注册</div>
          <FormItem<LoginParams & { email: string }> name="username">
            <Input placeholder="请输入用户名" size="large" />
          </FormItem>
          <FormItem<LoginParams & { email: string }> name="email">
            <Input placeholder="请输入邮箱" size="large" />
          </FormItem>
          <FormItem<LoginParams & { email: string }> name="password" rules={[{ message: '请输入密码' }]}>
            <Input.Password placeholder="请输入密码" size="large" />
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              htmlType="submit"
              autoInsertSpace
              block
              size="large"
              className="mt-4"
              loading={loading}
            >
              注册
            </Button>
          </FormItem>
        </Form>

        <div className="justify-center item-center  mt-3 flex">
          <Button type="link" onClick={() => navigate('/login')}>返回登录</Button>
        </div>
      </Card>
    </div>
  );
};
