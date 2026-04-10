import { scenarioCatalog } from "./git-sim/scenario-catalog";
import { parseGitCommand } from "./git-sim/command-parser";
import { getLearningScenario, getScenarioTeachingNote, type LearningScenarioTeachingNote } from "./git-sim/learning-guide";
import { getScenarioPreset } from "./git-sim/scenario-presets";

export type CommandDocCategory = "basics" | "branching" | "remote" | "advanced" | "worktree";
export type FeaturedDocScenarioEmphasis = "primary" | "secondary";

export interface PracticeScenarioLink {
  id: string;
  title: string;
  href: string;
  badge?: string;
  emphasis?: FeaturedDocScenarioEmphasis;
}

export interface PracticeGuidance {
  scenario: {
    id: string;
    title: string;
    summary: string;
    objective: string;
    href: string;
  };
  step: {
    title: string;
    goal: string;
    command: string;
    href: string;
    stepNumber: number;
    totalSteps: number;
  };
}

export interface CommandDoc {
  id: string;
  command: string;
  syntax: string;
  summary: string;
  category: CommandDocCategory;
  detailHref: string;
  playgroundCommand: string;
  playgroundHref: string;
  useCases: string[];
  keywords: string[];
  practiceScenario?: PracticeScenarioLink;
  practiceTeachingNote?: LearningScenarioTeachingNote;
}

export interface CommandDocGroup {
  id: CommandDocCategory;
  label: string;
  description: string;
  items: CommandDoc[];
}

export interface FeaturedDocScenario {
  id: string;
  title: string;
  summary: string;
  objective: string;
  badge: string;
  emphasis: FeaturedDocScenarioEmphasis;
  primaryCommand: string;
  playgroundHref: string;
  primaryDoc?: CommandDoc;
  pathIndex: number;
  pathTotal: number;
  nextScenario?: FeaturedDocScenarioPreview;
  teachingNote?: LearningScenarioTeachingNote;
}

export interface FeaturedDocScenarioPreview {
  id: string;
  title: string;
  badge: string;
  emphasis: FeaturedDocScenarioEmphasis;
  primaryCommand: string;
  playgroundHref: string;
  primaryDoc?: CommandDoc;
}

const featuredScenarioMeta = [
  { id: "solo-project", badge: "推荐起点", emphasis: "primary" as const },
  { id: "team-collab", badge: "协作进阶", emphasis: "secondary" as const },
  { id: "conflict-resolution", badge: "问题处理", emphasis: "secondary" as const },
  { id: "version-rollback", badge: "历史修复", emphasis: "secondary" as const }
];

const categoryMeta: Array<Omit<CommandDocGroup, "items">> = [
  {
    id: "basics",
    label: "Basics",
    description: "从初始化、查看状态到生成第一批提交的基础命令。"
  },
  {
    id: "branching",
    label: "Branching",
    description: "围绕分支创建、切换和引用移动的日常分支命令。"
  },
  {
    id: "remote",
    label: "Remote",
    description: "和 origin 交互时最常用的 clone、fetch、pull、push 系列命令。"
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "回退、修复和标签这类更偏历史管理的命令。"
  },
  {
    id: "worktree",
    label: "Worktree",
    description: "在同一仓库对象库上并行挂出多个工作目录。"
  }
];

function createPlaygroundHref(command: string): string {
  return `/playground?command=${encodeURIComponent(command)}`;
}

function createScenarioPlaygroundHref(scenarioId: string, command: string): string {
  return `/playground?scenario=${encodeURIComponent(scenarioId)}&command=${encodeURIComponent(command)}`;
}

function getPracticeScenarioLink(scenarioId?: string): PracticeScenarioLink | undefined {
  if (!scenarioId) {
    return undefined;
  }

  const scenario = scenarioCatalog.find((entry) => entry.id === scenarioId);
  if (!scenario) {
    return undefined;
  }

  const featuredMeta = featuredScenarioMeta.find((entry) => entry.id === scenario.id);

  return {
    id: scenario.id,
    title: scenario.title,
    href: scenario.playgroundHref,
    ...(featuredMeta
      ? {
          badge: featuredMeta.badge,
          emphasis: featuredMeta.emphasis
        }
      : {})
  };
}

function createCommandDoc(
  id: string,
  category: CommandDocCategory,
  syntax: string,
  summary: string,
  playgroundCommand: string,
  useCases: string[],
  keywords: string[] = [],
  practiceScenarioId?: string
): CommandDoc {
  return {
    id,
    command: `git ${id}`,
    syntax,
    summary,
    category,
    detailHref: `/docs/${id}`,
    playgroundCommand,
    playgroundHref: createPlaygroundHref(playgroundCommand),
    useCases,
    keywords,
    practiceScenario: getPracticeScenarioLink(practiceScenarioId),
    practiceTeachingNote: getScenarioTeachingNote(practiceScenarioId ?? "")
  };
}

export const commandDocs: CommandDoc[] = [
  createCommandDoc("init", "basics", "git init", "初始化一个新的本地 Git 仓库。", "git init", [
    "开始一个全新的个人项目",
    "把已有目录纳入 Git 跟踪"
  ], ["新建仓库", "开始项目", "初始化项目"], "solo-project"),
  createCommandDoc("status", "basics", "git status", "查看工作区、暂存区和当前分支的即时状态。", "git status", [
    "确认哪些文件还没暂存",
    "观察冲突是否已经解决"
  ], ["当前状态", "仓库状态", "检查改动"], "conflict-resolution"),
  createCommandDoc("add", "basics", "git add <file>|.", "把工作区内容放进暂存区，准备进入下一次提交。", "git add .", [
    "选择下一次提交要包含的文件",
    "冲突解决后标记文件已处理"
  ], ["暂存", "加入提交", "标记已解决"], "solo-project"),
  createCommandDoc("commit", "basics", 'git commit -m "message"', "把暂存区内容写成一条可回看的提交记录。", 'git commit -m "first commit"', [
    "保存一个稳定快照",
    "结束一次冲突解决或功能开发"
  ], ["提交代码", "保存快照", "记录改动"], "solo-project"),
  createCommandDoc("log", "basics", "git log", "沿着当前 HEAD 往回查看提交历史。", "git log", [
    "复盘最近做过什么",
    "确认回退前后的历史差异"
  ], ["提交历史", "历史记录", "查看日志"], "version-rollback"),
  createCommandDoc("diff", "basics", "git diff [--staged]", "查看尚未提交的内容变化。", "git diff --staged", [
    "提交前检查暂存区内容",
    "比较工作区或暂存区改动"
  ], ["改动对比", "差异", "变更预览"], "solo-project"),
  createCommandDoc("restore", "basics", "git restore --staged <file>", "把文件从暂存区撤回到工作区。", "git restore --staged README.md", [
    "撤销一次误加到暂存区的文件",
    "重新整理本次提交内容"
  ], ["撤销暂存", "取消暂存", "撤回文件"], "conflict-resolution"),
  createCommandDoc("branch", "branching", "git branch <name>", "创建分支或列出本地分支。", "git branch release", [
    "切出发布用的 release 分支",
    "查看当前仓库有哪些本地分支"
  ], ["分支列表", "创建分支", "发布分支"], "release-management"),
  createCommandDoc("switch", "branching", "git switch <branch>|-c <branch>", "切换到已有分支，或创建并切换到新分支。", "git switch -c feature/team-work", [
    "开始一条新的 feature 分支",
    "回到 main 或 release 继续操作"
  ], ["切换分支", "新建分支", "feature 分支"], "team-collab"),
  createCommandDoc("checkout", "branching", "git checkout <branch>|-b <branch>", "与 switch 类似的经典分支切换命令。", "git checkout -b feature/checkout-flow", [
    "兼容旧资料中的 checkout 用法",
    "对照 switch 理解旧命令风格"
  ], ["切换分支", "旧命令", "checkout 分支"], "team-collab"),
  createCommandDoc("clone", "remote", "git clone <url>", "把远端仓库完整拉到本地，并建立 origin/main。", "git clone https://github.com/opengit/example.git", [
    "加入一个已有团队项目",
    "从远端拿到初始提交和引用"
  ], ["克隆仓库", "拉代码", "加入项目"], "team-collab"),
  createCommandDoc("remote", "remote", "git remote -v", "查看当前仓库配置的远端地址。", "git remote -v", [
    "确认 origin 指向哪里",
    "分清 fetch 与 push 的远端地址"
  ], ["远端地址", "origin", "远程仓库"], "team-collab"),
  createCommandDoc("fetch", "remote", "git fetch", "只同步远端引用，不直接改动当前工作区。", "git fetch", [
    "先更新 origin/* 引用再决定下一步",
    "观察远端领先了多少提交"
  ], ["同步远端", "拉最新引用", "远程更新"], "team-collab"),
  createCommandDoc("pull", "remote", "git pull", "先 fetch 再尝试把远端更新合并到当前分支。", "git pull", [
    "拉取 teammate 的最新提交",
    "在冲突场景里观察 unmerged paths"
  ], ["拉代码", "同步代码", "合并远端", "远程协作"], "conflict-resolution"),
  createCommandDoc("push", "remote", "git push", "把当前分支的本地提交同步到远端。", "git push", [
    "把 feature 分支发到 origin",
    "完成个人项目或团队协作的同步"
  ], ["推送代码", "同步远端", "推送分支"], "team-collab"),
  createCommandDoc("reset", "advanced", "git reset [--soft|--mixed|--hard] <target>", "移动当前分支和 HEAD，按模式决定工作区与暂存区是否回退。", "git reset --soft HEAD~1", [
    "比较 reset 和 revert 的差异",
    "只回退提交指针但保留改动"
  ], ["回滚", "回退", "撤销提交"], "version-rollback"),
  createCommandDoc("revert", "advanced", "git revert <target>", "保留历史并追加一条反向提交来撤销旧改动。", "git revert HEAD", [
    "在共享历史里安全撤销错误提交",
    "练习生成修复提交而不是改写历史"
  ], ["回滚", "回退", "修复提交", "撤销提交"], "version-rollback"),
  createCommandDoc("tag", "advanced", "git tag <name>", "给当前提交打一个稳定标签。", "git tag v1.0.0", [
    "标记一个发布节点",
    "配合 git push --tags 同步到远端"
  ], ["发版", "发布", "版本号", "release"], "release-management"),
  createCommandDoc("worktree", "worktree", "git worktree add|list|remove", "从同一个仓库对象库挂出多个工作目录并行开发。", "git worktree list", [
    "feature 开发中临时切 hotfix",
    "对比 worktree 和 stash 的差异"
  ], ["热修复", "hotfix", "并行开发", "多工作目录"], "worktree-parallel")
];

export function getGroupedCommandDocs(): CommandDocGroup[] {
  return categoryMeta.map((group) => ({
    ...group,
    items: commandDocs.filter((entry) => entry.category === group.id)
  }));
}

export function searchGroupedCommandDocs(query: string): CommandDocGroup[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return getGroupedCommandDocs();
  }

  return categoryMeta
    .map((group) => ({
      ...group,
      items: commandDocs.filter((entry) => {
        if (entry.category !== group.id) {
          return false;
        }

        const haystack = [
          entry.command,
          entry.syntax,
          entry.summary,
          ...entry.useCases,
          ...entry.keywords,
          entry.practiceScenario?.title ?? ""
        ]
          .join("\n")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
    }))
    .filter((group) => group.items.length > 0);
}

export function getDocsHrefForCommandInput(input: string): string {
  const doc = getCommandDocForInput(input);
  return doc ? doc.detailHref : "/docs";
}

export function getCommandDocForInput(input: string): CommandDoc | undefined {
  const parsed = parseGitCommand(input);
  if (!parsed.isGit) {
    return undefined;
  }

  return commandDocs.find((entry) => entry.id === parsed.name);
}

export function getPracticeGuidanceForCommandDoc(docId: string): PracticeGuidance | undefined {
  const doc = getCommandDocBySlug(docId);
  if (!doc?.practiceScenario) {
    return undefined;
  }

  const scenarioMeta = scenarioCatalog.find((entry) => entry.id === doc.practiceScenario?.id);
  if (!scenarioMeta) {
    return undefined;
  }

  const preset = getScenarioPreset(scenarioMeta.id);
  const learningScenario = getLearningScenario(preset.gitState, scenarioMeta.id);
  const stepIndex = learningScenario.checklist.findIndex((item) => {
    const parsed = parseGitCommand(item.command);
    return parsed.isGit && parsed.name === doc.id;
  });
  const step = stepIndex >= 0 ? learningScenario.checklist[stepIndex] : undefined;

  if (!step) {
    return undefined;
  }

  return {
    scenario: {
      id: scenarioMeta.id,
      title: scenarioMeta.title,
      summary: scenarioMeta.summary,
      objective: scenarioMeta.objective,
      href: createScenarioPlaygroundHref(scenarioMeta.id, step.command)
    },
    step: {
      title: step.title,
      goal: step.goal,
      command: step.command,
      href: createScenarioPlaygroundHref(scenarioMeta.id, step.command),
      stepNumber: stepIndex + 1,
      totalSteps: learningScenario.checklist.length
    }
  };
}

export function getPracticeTeachingNoteForCommandDoc(docId: string): LearningScenarioTeachingNote | undefined {
  const doc = getCommandDocBySlug(docId);
  const scenarioId = doc?.practiceScenario?.id;

  if (!scenarioId) {
    return undefined;
  }

  return getScenarioTeachingNote(scenarioId);
}

export function getFeaturedScenarioMeta(scenarioId: string) {
  return featuredScenarioMeta.find((entry) => entry.id === scenarioId);
}

export function getNextFeaturedScenarioForScenarioId(scenarioId: string): FeaturedDocScenario | undefined {
  const currentFeaturedIndex = featuredScenarioMeta.findIndex((entry) => entry.id === scenarioId);
  if (currentFeaturedIndex < 0) {
    return undefined;
  }

  const nextFeaturedMeta = featuredScenarioMeta[currentFeaturedIndex + 1];
  if (!nextFeaturedMeta) {
    return undefined;
  }

  return getFeaturedDocScenarios().find((entry) => entry.id === nextFeaturedMeta.id);
}

export function getNextFeaturedScenarioForCommandDoc(docId: string): FeaturedDocScenario | undefined {
  const practiceGuidance = getPracticeGuidanceForCommandDoc(docId);
  if (!practiceGuidance) {
    return undefined;
  }

  return getNextFeaturedScenarioForScenarioId(practiceGuidance.scenario.id);
}

export function getFeaturedDocScenarios(): FeaturedDocScenario[] {
  const featuredEntries = featuredScenarioMeta
    .map((entry) => {
      const scenario = scenarioCatalog.find((item) => item.id === entry.id);
      return scenario ? { scenario, meta: entry } : undefined;
    })
    .filter(
      (
        entry
      ): entry is {
        scenario: (typeof scenarioCatalog)[number];
        meta: (typeof featuredScenarioMeta)[number];
      } => Boolean(entry)
    );

  const pathTotal = featuredEntries.length;

  return featuredEntries.map(({ scenario, meta }, index) => {
    const nextEntry = featuredEntries[index + 1];

    return {
      id: scenario.id,
      title: scenario.title,
      summary: scenario.summary,
      objective: scenario.objective,
      badge: meta.badge,
      emphasis: meta.emphasis,
      primaryCommand: scenario.primaryCommand,
      playgroundHref: scenario.playgroundHref,
      primaryDoc: getCommandDocForInput(scenario.primaryCommand),
      pathIndex: index + 1,
      pathTotal,
      teachingNote: getScenarioTeachingNote(scenario.id),
      nextScenario: nextEntry
        ? {
            id: nextEntry.scenario.id,
            title: nextEntry.scenario.title,
            badge: nextEntry.meta.badge,
            emphasis: nextEntry.meta.emphasis,
            primaryCommand: nextEntry.scenario.primaryCommand,
            playgroundHref: nextEntry.scenario.playgroundHref,
            primaryDoc: getCommandDocForInput(nextEntry.scenario.primaryCommand)
          }
        : undefined
    };
  });
}

export function getCommandDocBySlug(slug: string): CommandDoc | undefined {
  return commandDocs.find((entry) => entry.id === slug);
}

export function getAllCommandDocSlugs(): string[] {
  return commandDocs.map((entry) => entry.id);
}
