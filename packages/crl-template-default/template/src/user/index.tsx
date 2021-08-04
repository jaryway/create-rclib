import React, { FC } from "react";
import { Button, Form, Input as AntInput } from "antd";

interface UserProps {}

const User: FC<UserProps> = () => {
  return (
    <div>
      <Form>
        <Form.Item>
          <AntInput />
        </Form.Item>
        <Form.Item>
          <Button>Save</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default User;
