import StaggeredMenu, {
  type StaggeredMenuItem,
} from "./staggered-menu";

const MENU_ITEMS: StaggeredMenuItem[] = [
  { label: "首页", link: "/home", ariaLabel: "前往首页" },
  { label: "内容馆", link: "/library", ariaLabel: "前往内容馆" },
  { label: "心理测评", link: "/assessment", ariaLabel: "前往心理测评" },
  {
    label: "小爱心理倾诉",
    link: "/xiaoai",
    ariaLabel: "前往小爱心理倾诉",
  },
  { label: "心理咨询", link: "/consultation", ariaLabel: "前往心理咨询" },
];

export default function OfficialMenu() {
  return (
    <StaggeredMenu
      className="official-staggered-menu"
      position="right"
      items={MENU_ITEMS}
      colors={["#F1EEFA", "#CDBFFC", "#6F64A8"]}
      menuLabel="菜单"
      closeLabel="关闭"
      menuButtonColor="#4A4266"
      openMenuButtonColor="#6F64A8"
      accentColor="#6F64A8"
      isFixed
      closeOnClickAway
    />
  );
}
