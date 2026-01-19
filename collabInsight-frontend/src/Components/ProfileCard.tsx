import React, { useState, useEffect, useContext } from 'react';
import { Card, Avatar, Form, Input, Radio, Button, message, Upload, Modal, Spin } from 'antd';
import { UserOutlined, UploadOutlined, CameraOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { getUserProfile, updateUserProfile, uploadAvatar } from '@/request/api/user/profile';
import type { UpdateProfileParams, FormItemLayoutProps } from '@/request/type';
import { HomeContext } from '@/views/home/Home';
import { eventBus, Events } from '@/utils/eventBus';

const { TextArea } = Input;

// 表单项布局组件
const FormItemLayout: React.FC<FormItemLayoutProps> = ({
  label,
  colon = true,
  required = false,
  disabled = false,
  name,
  rules,
  input,
}) => {
  return (
    <div className="flex items-center">
      <div className={`w-16 text-left ${required ? 'text-red-500' : ''}`}>
        {label}
        {colon ? '：' : ''}
      </div>
      <div className="flex-1 ml-2">
        <Form.Item name={name} rules={rules} noStyle>
          {disabled ? <Input readOnly disabled /> : input}
        </Form.Item>
      </div>
    </div>
  );
};

const ProfileCard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [avatarFileList, setAvatarFileList] = useState<UploadFile[]>([]);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState<boolean>(false);

  // 获取Home组件的上下文，用于更新Header中的头像
  const { setShowProfileCard: _setShowProfileCard } = useContext(HomeContext);

  // 更新Header头像的函数
  const updateHeaderAvatar = (avatarUrl: string) => {
    // 触发头像更新事件，通知Home组件更新头像
    eventBus.emit(Events.USER_AVATAR_UPDATED, avatarUrl);
  };

  // 获取用户信息
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile();
        form.setFieldsValue({
          _id: profile._id,
          nickname: profile.nickname,
          gender: profile.gender,
          bio: profile.bio,
          avatar: profile.avatar,
        });
      } catch (error) {
        message.error('获取个人信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [form]);

  // 处理表单提交
  const handleFinish = async (values: UpdateProfileParams) => {
    try {
      await updateUserProfile(values);
      // HTTP拦截器已经显示了成功消息，这里不需要再显示
      // 重新获取用户信息以刷新显示
      const profile = await getUserProfile();
      form.setFieldsValue({
        _id: profile._id,
        nickname: profile.nickname,
        gender: profile.gender,
        bio: profile.bio,
        avatar: profile.avatar,
      });

      // 触发用户信息更新事件
      eventBus.emit(Events.USER_PROFILE_UPDATED);

      // 关闭个人中心页面
      setTimeout(() => {
        onClose();
      }, 1000); // 延迟1秒关闭，让用户看到成功消息
    } catch (error) {
      // 错误消息由HTTP拦截器统一处理，这里不需要再显示
      console.error('更新个人信息失败:', error);
    }
  };

  // 处理头像上传前的检查
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
      return false;
    }
    return true;
  };

  // 头像上传配置
  const uploadProps: UploadProps = {
    name: 'avatar',
    fileList: avatarFileList,
    beforeUpload: beforeUpload,
    maxCount: 1,
    onChange: ({ fileList }) => {
      setAvatarFileList(fileList);
    },
    showUploadList: {
      showPreviewIcon: false,
      showRemoveIcon: false,
      showDownloadIcon: false,
    },
  };

  // 处理头像上传
  const handleUpload = async () => {
    try {
      if (avatarFileList.length === 0) {
        message.error('请选择要上传的头像');
        return;
      }

      setUploadLoading(true);
      const formData = new FormData();
      formData.append('avatar', avatarFileList[0].originFileObj as File);

      await uploadAvatar(formData);

      // 重新获取用户信息以刷新头像
      const profile = await getUserProfile();
      form.setFieldsValue({
        _id: profile._id,
        nickname: profile.nickname,
        gender: profile.gender,
        bio: profile.bio,
        avatar: profile.avatar,
      });

      // HTTP拦截器已经显示了成功消息，这里不需要再显示
      setAvatarFileList([]);
      setAvatarModalVisible(false);

      // 更新Header中的头像
      updateHeaderAvatar(form.getFieldValue('avatar'));
    } catch (error: any) {
      // 错误消息由HTTP拦截器统一处理，这里不需要再显示
      console.error('头像上传失败:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 ">
      <Card
        className="col-span-1 shadow-xl rounded-lg border-2 bg-white max-w-[80vw] w-[500px] overflow-auto"
        title={
          <div className="flex items-center justify-center">
            <UserOutlined className="mr-2" />
            <span>个人中心</span>
          </div>
        }
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spin size="large" />
          </div>
        ) : (
          <div className="p-2">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <Avatar
                  size={80}
                  src={
                    form.getFieldValue('avatar')
                      ? form.getFieldValue('avatar').startsWith('http')
                        ? form.getFieldValue('avatar')
                        : `http://localhost:5000${form.getFieldValue('avatar')}`
                      : ''
                  }
                  icon={<UserOutlined />}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setAvatarModalVisible(true)}
                />
                <div
                  className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600 transition-colors"
                  onClick={() => setAvatarModalVisible(true)}
                >
                  <CameraOutlined />
                </div>
              </div>
              <div className="mt-2 text-gray-600">点击头像可更换</div>
            </div>

            <Form form={form} onFinish={handleFinish} className="w-full">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-16 text-left">ID ：</div>
                  <div className="flex-1 ml-2">
                    <Form.Item name="_id" noStyle>
                      <Input readOnly disabled className="w-full" />
                    </Form.Item>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-16 text-left">昵称 ：</div>
                  <div className="flex-1 ml-2">
                    <Form.Item
                      name="nickname"
                      rules={[{ required: true, message: '请输入昵称' }]}
                      noStyle
                    >
                      <Input placeholder="请输入昵称" className="w-full" />
                    </Form.Item>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-16 text-left">性别 ：</div>
                  <div className="flex-1 ml-2">
                    <Form.Item
                      name="gender"
                      rules={[{ required: true, message: '请选择性别' }]}
                      noStyle
                    >
                      <Radio.Group>
                        <Radio value="male">男</Radio>
                        <Radio value="female">女</Radio>
                        <Radio value="other">其他</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-16 text-left">个人简介 ：</div>
                  <div className="flex-1 ml-2">
                    <Form.Item
                      name="bio"
                      rules={[{ max: 200, message: '个人简介不能超过200个字符' }]}
                      noStyle
                    >
                      <TextArea
                        placeholder="请输入个人简介"
                        rows={4}
                        showCount
                        maxLength={200}
                        className="w-full"
                      />
                    </Form.Item>
                  </div>
                </div>

                <Form.Item>
                  <div className="flex flex-col space-y-3 mt-4">
                    <Button
                      type="primary"
                      htmlType="submit"
                      autoInsertSpace
                      block
                      size="large"
                      loading={loading}
                    >
                      保存修改
                    </Button>
                    <Button type="default" onClick={onClose} block size="large">
                      关闭
                    </Button>
                  </div>
                </Form.Item>
              </div>
            </Form>
          </div>
        )}

        {/* 头像上传弹窗 */}
        <Modal
          title="更换头像"
          open={avatarModalVisible}
          onCancel={() => {
            setAvatarModalVisible(false);
            setAvatarFileList([]);
          }}
          footer={null}
          width={500}
        >
          <Upload {...uploadProps} className="flex justify-center mb-2">
            <Button icon={<UploadOutlined />}>选择头像</Button>
          </Upload>
          <div className="text-gray-500 text-sm text-center mb-4">
            提示：只能上传JPG/PNG/GIF格式的图片，且大小不能超过2MB
          </div>
          <div className="flex justify-center">
            <Button
              type="primary"
              onClick={handleUpload}
              loading={uploadLoading}
              disabled={avatarFileList.length === 0}
            >
              上传头像
            </Button>
          </div>
        </Modal>
      </Card>
    </div>
  );
};

export default ProfileCard;
