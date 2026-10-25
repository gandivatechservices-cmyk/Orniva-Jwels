export interface FooterLinkItem {
  label: string;
  href?: string;
  isPending?: boolean;
  pendingNotice?: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLinkItem[];
}

export interface FooterProps {
  className?: string;
}
