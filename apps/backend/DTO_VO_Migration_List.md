# DTO/VO 迁移清单

本次重构将所有 DTO 和 VO 从原有的 `domain` 根目录或 `domain.dto` 包迁移到了按业务领域划分的子包中。

## 1. 通用对象 (Common)
| 类名 | 原路径 | 新路径 | 说明 |
| :--- | :--- | :--- | :--- |
| `Result` | `domain.Result` | `domain.common.Result` | 通用响应结果封装 |
| `PageResult` | `domain.PageResult` | `domain.common.PageResult` | 分页响应结果封装 |
| `LoginUser` | `domain.LoginUser` | `domain.common.LoginUser` | 安全认证用户封装 |
| `JwtProperties` | `domain.JwtProperties` | `domain.common.JwtProperties` | JWT 配置属性 |

## 2. 内容管理 (Content)
| 类名 | 原路径 | 新路径 | 说明 |
| :--- | :--- | :--- | :--- |
| `CourseDTO` | `domain.dto.CourseDTO` | `domain.content.dto.CourseDTO` | 课程信息传输对象 |

## 3. 咨询服务 (Consultation)
| 类名 | 原路径 | 新路径 | 说明 |
| :--- | :--- | :--- | :--- |
| `AiChatDTO` | `domain.dto.AiChatDTO` | `domain.consultation.dto.AiChatDTO` | AI 对话传输对象 |
| `DashScopeRequest` | `domain.dto.DashScopeRequest` | `domain.consultation.dto.DashScopeRequest` | 大模型请求对象 |

## 4. 医院管理 (Hospital)
| 类名 | 原路径 | 新路径 | 说明 |
| :--- | :--- | :--- | :--- |
| `DoctorDTO` | *(内部类/新增)* | `domain.hospital.dto.DoctorDTO` | 医生信息传输对象 (从 AdminController 提取) |

## 5. 实体对象 (POJO)
实体对象保留在 `domain.pojo` 包下，作为数据库映射对象。
