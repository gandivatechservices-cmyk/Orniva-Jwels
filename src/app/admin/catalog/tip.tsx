import type { ReactNode } from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

/** Form.Item `tooltip` that shows an info icon next to the label with a short explanation. */
export const tip = (title: ReactNode) => ({ title, icon: <InfoCircleOutlined /> });

/** Text followed by an info icon, for headings and column titles that aren't a Form.Item label. */
export function InfoLabel({ children, info }: { children: ReactNode; info: ReactNode }) {
  return (
    <span>
      {children}{" "}
      <Tooltip title={info}>
        <InfoCircleOutlined style={{ color: "var(--muted)" }} aria-label="More info" />
      </Tooltip>
    </span>
  );
}
