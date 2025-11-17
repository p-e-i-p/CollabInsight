import { login } from '@/request/api/login';
import type { LoginParams } from '@/request/api/login/type';
import auth from '@/utils/http';
import { Form, Button, Input, Card } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [LoginFrom] = Form.useForm<LoginParams>();
  const navigate = useNavigate();
  const [loading, setloading] = useState(false);
  const handelLogin = async (values: LoginParams) => {
    console.log(values);
    try {
      setloading(true);
      const res = await login(values);
      auth.setToken(res.token);
      navigate('/');
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-8 items-center justify-stretch p-4 md:p-8 bg-login">
      <div className="hidden md:block col-span-5"></div>
      {/* 登录 */}
      <Card className=" col-span-1  text-center  shadow-xl rounded-lg border-2 backdrop-blur-sm bg-white/95 max-w-[90vw] w-[370px] h-[450px] ">
        <Form form={LoginFrom} onFinish={handelLogin}>
          <div className="text-xl pb-4 my-3">账号登录</div>
          <FormItem<LoginParams> name="username">
            <Input placeholder="请输入用户名" size="large" />
          </FormItem>
          <FormItem<LoginParams> name="password" rules={[{ message: '请输入密码' }]}>
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
              登录
            </Button>
          </FormItem>
        </Form>

        <div className="justify-center item-center  mt-3 flex">
          <Button type="link" className="color-indigo-500">
            忘记密码
          </Button>
          <Button type="link" onClick={() => navigate('/register')}>
            注册新账号
          </Button>
        </div>
      </Card>
      {/* 注册 */}
      {/* <Card></Card> */}
    </div>
  );
};
