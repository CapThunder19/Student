'use client';

import { Button, Card, Statistic, Progress, Tag, Avatar } from 'antd';
import { UserOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import React from 'react';

export default function AntDesignShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Ant Design Components</h3>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <Statistic
              title="Total Students"
              value={1128}
              prefix="👥"
            />
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <Statistic
              title="Assignment Score"
              value={98}
              suffix="/ 100"
              prefix="📊"
            />
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <Statistic
              title="Completion Rate"
              value={93}
              suffix="%"
              prefix="✅"
            />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card title="Card Example 1" bordered={false}>
            <p>This is an Ant Design card component with custom styling.</p>
            <Progress percent={75} />
          </Card>
          <Card title="Card Example 2" bordered={false}>
            <p>Ant Design provides ready-to-use UI components.</p>
            <div className="flex gap-2 mt-4">
              <Tag color="blue">UI Components</Tag>
              <Tag color="green">Modern</Tag>
              <Tag color="orange">Professional</Tag>
            </div>
          </Card>
        </div>

        {/* Buttons */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Button Variants</h4>
          <div className="flex flex-wrap gap-3">
            <Button type="primary">Primary Button</Button>
            <Button>Default Button</Button>
            <Button danger>Danger Button</Button>
            <Button type="dashed">Dashed Button</Button>
            <Button type="text">Text Button</Button>
            <Button disabled>Disabled Button</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
