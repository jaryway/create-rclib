import React, { FC } from "react";
import { Button, Form, Input } from "antd";

interface TestComponentProps {}

const TestComponent: FC<TestComponentProps> = () => {
  return (
    <div>
      <Form>
        <Form.Item>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button>Save</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default TestComponent;
