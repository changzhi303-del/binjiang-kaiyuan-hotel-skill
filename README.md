![Version](https://img.shields.io/badge/version-4.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Agent Skill](https://img.shields.io/badge/protocol-Agent%20Skill-purple)

这是杭州滨江开元名都大酒店的官方 AI Skill——安装后，你的 AI 助手就能查询酒店房型、婚宴场地、会议厅规格、周边交通，还能帮你完成婚礼秀报名和留言反馈，全程不用打开浏览器。

## 关于酒店

| 项目 | 内容 |
|------|------|
| 酒店名称 | 杭州滨江开元名都大酒店 |
| 地址 | 浙江省杭州市滨江区火炬大道岩大房巷59号 |
| 联系电话 | 0571-56971666 |
| 客房数量 | 261间 |
| 开业时间 | 2022年10月 |
| 官方网站 | [AI 演示版](https://hangzhou-binjiang-kaiyuan-hotel.pages.dev/)（仅供参考） |

## 这个 Skill 能做什么

| 能力 | 你可以问 |
|------|---------|
| 酒店介绍 | "酒店在哪？""怎么停车？""离西湖多远？" |
| 房型查询 | "有什么房型？""行政套房多大？""加床怎么收费？" |
| 婚宴场地 | "婚宴厅有哪些？""30桌适合哪个厅？""名都厅有什么特色？" |
| 婚宴套餐 | "菜单有哪些档位？""可以自带酒水吗？""能加桌吗？" |
| 会议场地 | "最大会议室能坐多少人？""开元厅能进车吗？""茶歇怎么收费？" |
| 餐饮服务 | "中餐厅有什么招牌菜？""早餐几点开始？" |
| 周边交通 | "坐地铁怎么到？""从萧山机场多久？" |
| **婚礼秀报名** | "我想参加婚礼秀" → AI 收集信息后直接帮你报名 |
| **留言反馈** | "我有个建议" → AI 整理后直接提交到酒店后台 |

## 安装

### 最简单的方式：告诉你的 AI 助手

直接把这句话发给你的 AI 助手：

> 帮我安装杭州滨江开元名都大酒店 Skill，仓库地址：https://github.com/changzhi303-del/binjiang-kaiyuan-hotel-skill

AI 助手会自动克隆仓库并安装到对应的 Skill 目录。

### 手动安装

将本仓库克隆到你的 AI 工具对应的 Skill 目录：

| AI 工具 | Skill 目录 |
|---------|-----------|
| Claude Code | `.claude/skills/binjiang-kaiyuan-hotel-skill/` |
| Cursor | `.cursor/skills/binjiang-kaiyuan-hotel-skill/` |
| Windsurf | `.windsurf/skills/binjiang-kaiyuan-hotel-skill/` |
| Trae | `.trae/skills/binjiang-kaiyuan-hotel-skill/` |
| Qoder | `.qoder/skills/binjiang-kaiyuan-hotel-skill/` |
| 通用 | `.agents/skills/binjiang-kaiyuan-hotel-skill/` |

```bash
# 示例：安装到 Claude Code
git clone https://github.com/changzhi303-del/binjiang-kaiyuan-hotel-skill.git \
  ~/.claude/skills/binjiang-kaiyuan-hotel-skill
```

目录下有 `SKILL.md` 文件，AI 助手下次启动时会自动加载。

## 使用示例

安装完成后，直接用自然语言问你的 AI 助手：

```
你好，我想了解一下杭州滨江开元名都大酒店的婚宴场地
```

```
帮我查一下酒店有没有空中花园婚礼场地，适合多少桌？
```

```
我想报名参加4月25日的春日婚礼秀
```

```
我对上次入住有个反馈想提交给酒店
```

## 联系我们

- **电话**：0571-56971666（24小时）
- **婚宴顾问**：13857180469（傅经理）
- **会议场地**：18621044118（陈经理）
- **地址**：浙江省杭州市滨江区火炬大道岩大房巷59号

## License

MIT © 2026 杭州滨江开元名都大酒店
