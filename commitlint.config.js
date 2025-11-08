/** @type {import('cz-git').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // @see: https://commitlint.js.org/#/reference-rules
    "body-leading-blank": [2, "always"],
    "footer-leading-blank": [1, "always"],
    "header-max-length": [2, "always", 108],
    "subject-empty": [2, "never"],
    "type-empty": [2, "never"],
    "subject-case": [0],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
        "wip",
        "workflow",
        "types",
        "release"
      ]
    ]
  },
  prompt: {
    types: [
      { value: "feat", name: "✨ 新功能：新增功能" },
      { value: "fix", name: "🐛 修复：修复缺陷" },
      { value: "docs", name: "📚 文档：更新文档" },
      { value: "refactor", name: "🔄 重构：代码重构（不新增功能也不修复 bug）" },
      { value: "perf", name: "🚀 性能：提升性能" },
      { value: "test", name: "🧪 测试：增加或更新测试" },
      { value: "chore", name: "🔧 工具：更改构建流程或辅助工具" },
      { value: "revert", name: "⏪ 回滚：代码回滚" },
      { value: "style", name: "🎨 样式：格式调整（不影响代码运行）" }
    ],
    scopes: ["root", "main", "renderer", "packages", "tools", "utils"],
    allowCustomScopes: true,
    skipQuestions: ["body", "footerPrefix", "footer", "breaking"], // 跳过“详细描述”和“底部信息”
    messages: {
      type: "📌 请选择提交类型：",
      scope: "🎯 请选择影响范围（可选）：",
      subject: "📝 请简短描述更改：",
      body: "🔍 详细描述（可选）：",
      footer: "🔗 关联的 ISSUE 或 BREAKING CHANGE（可选）：",
      confirmCommit: "✅ 确认提交？"
    }
  }
};
