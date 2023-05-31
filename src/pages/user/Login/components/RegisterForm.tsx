import {
  CheckCard,
  ProForm,
  ProFormText,
  // ProFormTextArea,
  StepsForm,
} from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Avatar, message, Modal } from 'antd';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

interface RegisterFormProps {
  visible: boolean;
  hideModal: () => void;
}

export const RegisterFrom: React.FC<RegisterFormProps> = (props) => {
  const [jobId, setJobId]: [string | undefined, React.Dispatch<React.SetStateAction<string>>] =
    useState('');

  // 根据 jobId 从爬虫获取 name
  const crawlName = async () => {
    try {
      const name = await request<Record<string, any>>('/api/crawl?noToken=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(name);
      return name;
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log(jobId);
    if (jobId !== undefined && jobId.length === 4) {
      const name = crawlName();
      console.log(name);
    }
  }, [jobId]);

  // 处理 JobId 变更
  // const handleJobIdChange = (value: any) => {
  //   setJobId(value);
  // };

  // 定义防抖处理函数，抖动指的是表单内容变化时频繁的触发 onChange
  const handleValuesChangeDebounced = debounce((value) => {
    // console.log('Form values changed:', value);
    if (value.jobId !== jobId) {
      setJobId(value.jobId);
    }
  }, 500);

  // 监控表单变化
  const handleFormValuesChange = (_changedValues: any, allValues: any) => {
    // handleValuesChangeDebounced(changedValues);
    handleValuesChangeDebounced(allValues);
    // 在这里进行表单内容变化的处理逻辑
  };

  const { visible, hideModal } = props;
  return (
    <>
      <StepsForm
        onFinish={async (values) => {
          console.log(values);
          await waitTime(1000);
          hideModal();
          message.success('提交成功');
        }}
        formProps={{
          validateMessages: {
            required: '此项为必填项',
          },
        }}
        stepsFormRender={(dom, submitter) => {
          return (
            <Modal
              title="分步表单"
              width={'45%'}
              onCancel={() => hideModal()}
              open={visible}
              footer={submitter}
              destroyOnClose
            >
              {dom}
            </Modal>
          );
        }}
      >
        <StepsForm.StepForm
          name="base"
          title="身份选择"
          onFinish={async (values) => {
            console.log(values);
            const { name, jobId } = values;
            if (name === jobId) {
              return true;
            }

            return false;
            // await waitTime(200);
            // return true;
          }}
          onValuesChange={handleFormValuesChange}
        >
          <ProForm.Group title="身份">
            <CheckCard.Group style={{ width: '100%' }} defaultValue="teacher">
              <CheckCard
                title="教师"
                avatar={
                  <Avatar
                    src="https://gw.alipayobjects.com/zos/bmw-prod/2dd637c7-5f50-4d89-a819-33b3d6da73b6.svg"
                    size="large"
                  />
                }
                description="账号可以获得更高的权限和使用教辅功能，注册需通过严格的身份认证。"
                value="teacher"
              />
              <CheckCard
                title="学生"
                disabled
                avatar={
                  <Avatar
                    src="https://gw.alipayobjects.com/zos/bmw-prod/6935b98e-96f6-464f-9d4f-215b917c6548.svg"
                    size="large"
                  />
                }
                description="学生可通过自己的专属账号，获取教学内容，参与教学过程。"
                value="student"
              />
            </CheckCard.Group>
          </ProForm.Group>
          <ProFormText
            name="name"
            width="md"
            label="您的真实姓名"
            // tooltip="最长为 24 位，用于标定的唯一 id"
            placeholder="请输入姓名"
            rules={[
              { required: true },
              { min: 2, message: '姓名至少为2个字' },
              { max: 30, message: '姓名最多为30个字' },
              { pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/, message: '姓名必须为纯中文或纯英文' },
            ]}
          />
          <ProFormText
            name="jobId"
            width="md"
            label="您的工号"
            tooltip="请提供校园网工号，用于验证教师身份"
            placeholder="请输入工号"
            rules={[
              { required: true },
              {
                pattern: /^[0-9]{3,5}$/,
                message: '工号一般是4位纯数字组成',
              },
            ]}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  );
};

{
  /* <StepsForm.StepForm name="time" title="完成设置">
<ProFormCheckbox.Group
  name="checkbox"
  label="部署单元"
  rules={[
    {
      required: true,
    },
  ]}
  options={['部署单元1', '部署单元2', '部署单元3']}
/>
<ProFormSelect
  label="部署分组策略"
  name="remark"
  rules={[
    {
      required: true,
    },
  ]}
  width="md"
  initialValue="1"
  options={[
    {
      value: '1',
      label: '策略一',
    },
    { value: '2', label: '策略二' },
  ]}
/>
<ProFormSelect
  label="Pod 调度策略"
  name="remark2"
  width="md"
  initialValue="2"
  options={[
    {
      value: '1',
      label: '策略一',
    },
    { value: '2', label: '策略二' },
  ]}
/>
</StepsForm.StepForm> */
}

{
  /*
          <ProFormText
            name="name"
            width="md"
            label="实验名称"
            tooltip="最长为 24 位，用于标定的唯一 id"
            placeholder="请输入名称"
            rules={[{ required: true }]}
          />
        <ProFormDatePicker name="date" label="日期" />
          <ProForm.Group title="时间选择">
            <ProFormDateTimePicker name="dateTime" label="开始时间" />
            <ProFormDatePicker name="date" label="结束时间" />
          </ProForm.Group>
          <ProFormTextArea name="remark" label="备注" width="lg" placeholder="请输入备注" />*/
}

{
  /* 
        <StepsForm.StepForm name="checkbox" title="验证邮箱">
          <ProFormCheckbox.Group
            name="checkbox"
            label="迁移类型"
            width="lg"
            options={['结构迁移', '全量迁移', '增量迁移', '全量校验']}
          />
          <ProForm.Group>
            <ProFormText width="md" name="dbname" label="业务 DB 用户名" />
            <ProFormDatePicker name="datetime" label="记录保存时间" width="sm" />
            <ProFormCheckbox.Group
              name="checkbox"
              label="迁移类型"
              options={['完整 LOB', '不同步 LOB', '受限制 LOB']}
            />
          </ProForm.Group> 
        </StepsForm.StepForm> */
}
