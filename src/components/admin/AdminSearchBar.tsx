import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

/** Large search bar shown above the table on every admin page. */
export function AdminSearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <Input
      allowClear
      size="large"
      prefix={<SearchOutlined style={{ color: "#14452b" }} />}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      style={{ borderColor: "#14452b", boxShadow: "0 2px 8px rgba(20, 69, 43, 0.12)", marginBottom: 12 }}
    />
  );
}
