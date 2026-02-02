# OBS Streaming Overlay Guide

## 什么是 OBS Overlay？

OBS Overlay 是一个专为直播串流设计的轻量级记分牌显示界面，可以作为浏览器源添加到 OBS Studio 或其他直播软件中。

## 快速开始

### 1. 访问 OBS Overlay

在浏览器中访问：
```
http://localhost:3000/obs
```

或者在部署后：
```
https://lacrossescoreboardonline.com/obs
```

### 2. 在 OBS Studio 中添加浏览器源

1. 在 OBS 中点击 "Sources" 面板的 "+"
2. 选择 "Browser"
3. 输入 Overlay URL
4. 设置宽度为 1920，高度为 1080（或你的直播分辨率）
5. ✅ 勾选 "Shutdown source when not visible"
6. ✅ 勾选 "Refresh browser when scene becomes active"
7. 点击 OK

### 3. 配置透明背景

OBS 的浏览器源会自动处理透明背景，无需额外设置。

## 样式选项

通过 URL 参数自定义 overlay 外观：

### 基础用法

```
/obs?style=scorebug                    # 默认：右上角记分牌样式
/obs?style=minimal                     # 极简风格
/obs?style=fullwidth                   # 全宽横幅样式
```

### 高级配置

```
/obs?style=scorebug&shotclock=false    # 隐藏进攻时间
/obs?style=scorebug&possession=false   # 隐藏球权指示
/obs?style=scorebug&period=false       # 隐藏节数
/obs?style=scorebug&transparent=false  # 不透明背景（测试用）
```

### 组合示例

```
# 全宽样式，隐藏进攻时间和节数
/obs?style=fullwidth&shotclock=false&period=false

# 极简样式，完全透明
/obs?style=minimal&transparent=true
```

## 三种样式详解

### 1. Scorebug（记分牌样式 - 默认）

**适用场景：** 标准体育直播，ESPN 风格

**特点：**
- 紧凑的垂直布局
- 显示两队得分、队伍颜色
- 实时比赛时间和进攻时钟
- 球权指示器（绿色圆点动画）
- 人数优势提示

**推荐位置：** 屏幕右上角或左上角

### 2. Minimal（极简样式）

**适用场景：** 简洁直播，不遮挡画面

**特点：**
- 单行横向布局
- 仅显示队名和得分
- 半透明背景
- 最小化屏幕占用

**推荐位置：** 屏幕顶部居中或底部

### 3. Fullwidth（全宽横幅）

**适用场景：** 专业赛事直播，电视台风格

**特点：**
- 全屏宽度横幅
- 大号字体易于阅读
- 队伍颜色背景
- 居中时间显示
- 人数优势横幅

**推荐位置：** 屏幕顶部或底部

## 实时同步

OBS Overlay 会自动与主记分牌应用同步：

1. 在主记分牌界面点击 "📡" 按钮
2. 创建或加入房间
3. OBS Overlay 会自动连接并实时更新

**注意：** Overlay 和控制器必须在同一个 Firebase 项目中才能同步。

## 性能优化建议

1. **减少 CPU 使用：**
   - 在 OBS 浏览器源设置中设置 FPS 为 30
   - 不观看场景时启用 "Shutdown source when not visible"

2. **流畅度：**
   - 确保网络稳定
   - 使用有线网络而非 WiFi

3. **延迟最小化：**
   - 将 overlay 和主控制器放在同一台电脑
   - 使用本地开发服务器（`localhost`）

## 键盘快捷键

在 OBS Overlay 页面（非主应用）：

| 快捷键 | 功能 |
|--------|------|
| `1` | 切换到 Scorebug 样式 |
| `2` | 切换到 Minimal 样式 |
| `3` | 切换到 Fullwidth 样式 |
| `T` | 切换透明背景 |
| `F11` | 全屏（浏览器快捷键） |

## 故障排查

### Overlay 不显示

- ✅ 确认 URL 正确（包含 `/obs`）
- ✅ 检查浏览器控制台是否有错误
- ✅ 尝试在常规浏览器中打开 URL 测试

### 不同步 / 数据不更新

- ✅ 确认主记分牌已启用实时同步
- ✅ 检查 Firebase 配置是否正确
- ✅ 刷新 OBS 浏览器源

### 透明背景失效

- ✅ 确认 OBS 浏览器源设置正确
- ✅ 尝试删除并重新添加浏览器源
- ✅ 检查 OBS 版本（建议 28.0 以上）

### 文字模糊或锯齿

- ✅ 设置浏览器源分辨率为你的直播分辨率
- ✅ 在 OBS 中右键浏览器源 → Transform → Fit to screen

## 高级定制

如果需要更多自定义选项，可以修改 `/src/components/OBSOverlay.css` 文件：

- 调整字体大小
- 修改颜色方案
- 改变布局位置
- 添加动画效果

## 技术支持

遇到问题？

1. 查看 [GitHub Issues](https://github.com/yourusername/lacrosse-scoreboard-online/issues)
2. 提交 Bug Report
3. 查看项目文档

---

**祝你直播顺利！🎬🏑**
