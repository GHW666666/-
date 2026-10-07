# 奶蛙快跑 · 微信小游戏

工程根目录的 project.config.json 使用 compileType: "game" 和 miniprogramRoot: "minigame/"。在微信开发者工具中导入整个「奶蛙快跑」目录；工具会在 minigame/ 找到 game.json 和构建好的 game.js。网页仍从根目录 index.html 启动。

## 构建与运行

1. 在工程根目录执行 npm install，再执行 npm run build:minigame。
2. 微信开发者工具导入工程根目录，类型选择「小游戏」，使用自己的小游戏 AppID。
3. 点击「编译」。如果工具已打开旧配置，关闭项目后重新导入工程根目录，让源码目录配置重新生效。
4. 真机预览与上传前，在开发者工具确认账号登录和 AppID。构建命令不负责上传。

修改 game/ 或 minigame/ 的源码后，重新执行 npm run build:minigame；不要手动编辑自动生成的 minigame/game.js。

## 文件

- game.json：小游戏全局配置，竖屏。
- game.js：自动构建的完整小游戏入口，包含 Three.js、共享跑酷逻辑和原生界面。
- entry.js：启动共享引擎、触控路由与界面合成。
- runtime.js：微信主画布、离屏纹理、尺寸与生命周期接口。
- renderResolution.js：按设备像素密度绘制，最高 3 倍、总像素不超过 400 万，并遵守 GPU 尺寸上限。
- ui.js：Canvas 界面；主页面、地图、衣橱、成就、个人排行榜、补给与暂停等。
- icons.js 与 assets/ui/：原生图标加载器和 26 张透明 PNG，包含首页、衣服、翅膀及地图图标。
- build-info.json：本次构建版本与大小，自动生成。
- project.config.json：独立导入此文件夹时使用的开发工具配置；通常导入工程根目录即可。

小游戏和网页使用同一份 3D 模型、地图、碰撞、金币价格、解锁、成就与排行逻辑。原生界面使用 Canvas 绘制；浏览器的 HTML、CSS 不会进入小游戏运行入口。微信存档通过 wx.getStorageSync 和 wx.setStorageSync 保存，与浏览器存档各自独立。

首页按网页版还原金币与距离卡片、气泡、珊瑚色开始按钮和底部导航；衣橱保留旋转试穿、分页与金币购买。布局避开微信胶囊和底部安全区。图标来自网页版 SVG 的透明 PNG 导出；图标加载失败时会绘制对应的矢量回退。系统字体与微信胶囊仍使用平台显示方式。

跑酷速度卡片按网页版使用深色双行样式，显示速度、m/s 与彩色状态。小游戏首页镜头固定，保留角色呼吸、歪头和互动动作，减少远景细线在像素网格上来回跳动；笑脸不接收身体的阴影。主屏幕与 HUD 使用相同物理分辨率，窗口缩放时会重新分配 HUD 纹理，避免尺寸变化造成渲染错误。提高分辨率会增加绘制成本，需在目标手机上核对帧率和清晰度。

修改网页版 SVG 图标后，可在安装 Playwright 和 Chrome 的开发环境执行 node scripts/export-native-icons.cjs，再执行 npm run build:minigame。导出工具只用于开发；小游戏运行不依赖浏览器或 Playwright。

当前 Three.js 渲染器需要 WebGL2。入口会检查渲染上下文；不支持时显示说明。真机效果与性能仍需在目标设备上验证。

小游戏头像推荐使用工程根目录的 assets/icons/naiwa-avatar-v4-wechat-512.jpg（512×512，约 66KB），展示奶蛙带翅膀跃过埃及车顶跨栏。头像供微信后台单独选择，不是小游戏启动配置项。

原创跑酷背景音乐为 assets/audio/naiwa-sunny-run.mp3，约 62 秒、969KB。build:minigame 会把它复制到 minigame/assets/audio/，运行时使用原生 InnerAudioContext 循环播放；WAV 母带与作曲脚本不进入小游戏代码包。暂停、静音、后台隐藏与重开由共享 AudioManager 处理，文件播放失败时回退合成 BGM。

配置结构参考微信官方示例：https://github.com/wechat-miniprogram/minigame-demo/blob/master/project.config.json
