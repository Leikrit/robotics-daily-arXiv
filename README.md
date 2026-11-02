<div align="center">
  <img src="assets/embodied-ai-daily-mark.svg" width="88" alt="Embodied AI Daily logo">
  <h1>Embodied AI Daily | 具身智能论文日报</h1>
  <p>面向具身智能、机器人学习、VLA 与世界模型的每日 arXiv 论文检索和 AI 辅助阅读站。</p>
  <p>
    <a href="https://leikrit.github.io/robotics-daily-arXiv/">在线阅读</a> ·
    <a href="https://github.com/Leikrit/robotics-daily-arXiv/actions/workflows/run.yml">运行状态</a> ·
    <a href="https://github.com/Leikrit/robotics-daily-arXiv/issues">问题反馈</a>
  </p>
</div>

## 项目定位

这是 [Leikrit](https://github.com/Leikrit) 基于 [Altman-conquer 的上游项目](https://github.com/Altman-conquer/robotics-daily-arXiv) 独立部署的 DeepSeek Flash 版本。项目每天从 `cs.RO`、`cs.AI`、`cs.LG`、`cs.CV` 抓取候选论文，先进行语义主题过滤，再为保留论文生成中文摘要、动机、方法、结果和结论。

重点覆盖：

- Vision-Language-Action（VLA）、机器人基础模型和世界模型
- 操作、灵巧操作、抓取、运动、导航和具身规划
- 机器人策略学习、视觉运动控制、模仿学习和强化学习
- Sim-to-Real、遥操作、Physical AI、具身数据集与评测
- 与物理智能直接相关的自动驾驶感知、规划和控制

通用计算机视觉、纯 NLP、通用 LLM 推理、图像生成或没有明确物理交互对象的工作会被过滤，减少信息噪声。

## 自动更新

GitHub Actions 工作流每天北京时间 `09:30` 自动执行：

1. 从 arXiv 抓取候选论文；
2. 与最近 7 天数据去重；
3. 用 LLM 筛选具身智能相关论文；
4. 并发生成结构化中文解读；
5. 生成 Markdown，并将结果发布到独立的 `data` 分支；
6. GitHub Pages 从 `main` 分支提供阅读界面。

本 fork 默认使用 DeepSeek Flash（API 模型名 `deepseek-flash`），接口为 `https://api.deepseek.com/v1`。默认关闭思考模式以降低日报筛选和摘要的延迟；可将 Actions Variable `DEEPSEEK_THINKING` 改成 `enabled`，并通过 `REASONING_EFFORT` 设置思考强度。工作流保留并发保护和 `330` 分钟硬超时。

## 部署

在你自己的 fork 中配置：

1. 打开 **Settings > Secrets and variables > Actions > New repository secret**，添加 `DEEPSEEK_API_KEY`，值为你自己的 DeepSeek API key。不要将密钥写入代码或网页。
2. 在 **Settings > Pages > Build and deployment > Source** 选择 **GitHub Actions**。
3. 在 **Actions** 启用 fork 的工作流，运行 **Deploy GitHub Pages**。它不需要 API key，只发布静态页面，不会把 Secrets 打包到网站。
4. 网站默认地址为 `https://<你的用户名>.github.io/<仓库名>/`。页面链接、统计信息和论文数据源会自动切换到你的 fork，而非上游仓库。
5. 添加 key 后，手动运行 **Embodied AI Daily** 验证每日抓取。之后每天北京时间 09:30 自动更新。

为兼容已有配置，仍支持 `OPENAI_API_KEY` Secret；`DEEPSEEK_API_KEY` 优先。无需添加 base URL Secret，默认已配置为 DeepSeek；如需更换服务，可设置 `OPENAI_BASE_URL` Variable。fork 时请保留 `data` 分支以展示已有公开历史内容；这些继承的解读不代表由 DeepSeek 重新生成，后续任务才使用新模型。

主要 Actions Variables：

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `CATEGORIES` | `cs.RO,cs.AI,cs.LG,cs.CV` | arXiv 候选类别 |
| `LANGUAGE` | `Chinese` | 生成语言 |
| `MODEL_NAME` | `deepseek-flash` | 筛选和摘要模型 |
| `DEEPSEEK_THINKING` | `disabled` | Flash 思考模式开关 |
| `REASONING_EFFORT` | `low` | 开启思考模式时的推理强度 |
| `AI_MAX_WORKERS` | `6` | 摘要并发数 |
| `TOPIC_FILTER_ENABLED` | `true` | 启用主题过滤 |
| `TOPIC_FILTER_MAX_WORKERS` | `3` | 主题筛选并发数 |
| `TOPIC_FILTER_KEEP_UNCERTAIN` | `false` | 是否保留低置信度负例 |

在 Actions 页面选择 `Embodied AI Daily` 可手动运行。当天数据已经存在时默认跳过；需要完整重跑时启用 `force_reprocess`。

新站点需要补历史数据时，可在 Actions 页面手动运行 `Backfill Embodied AI Papers`。开始和结束日期留空时，默认回填截至昨天的最近 30 个自然日；任务会按 5 天拆分，最多同时处理两个分块，所有分块成功后统一发布到 `data` 分支。历史数据按 arXiv 的首次提交日期归档，而每日任务按抓取日期归档，因此两者的日期语义略有不同；发布前会按论文 ID 与已有数据去重。

本地 Docker 仅作为 GitHub Actions 不可用时的后备方案，配置与运行方式见 [docs/docker-local.md](docs/docker-local.md)。密钥文件 `.env.docker.local` 已被 Git 忽略，不应提交到仓库。

## 数据与免责声明

网站展示内容由模型根据论文元数据和摘要自动生成，可能存在遗漏或错误；研究结论应以 arXiv 原文为准。论文版权归原作者所有，本项目只保存公开元数据和辅助解读。

## 独立维护与致谢

本项目从 [dw-dengwei/daily-arXiv-ai-enhanced](https://github.com/dw-dengwei/daily-arXiv-ai-enhanced) 演进而来，保留原始 Git 历史和贡献记录，并在其 Apache-2.0 许可下继续开发。当前的具身智能主题策略、并发流水线、数据分支和品牌由本仓库独立维护；上游项目不对本部署、内容或运营负责。

## License

[Apache License 2.0](LICENSE)
