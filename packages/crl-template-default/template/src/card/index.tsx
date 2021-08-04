import React, { FC } from "react";
import { Button, Form, Input } from "antd";

interface CardProps {}

const Card: FC<CardProps> = () => {
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

export default Card;
