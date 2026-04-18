# Controller 与 Service 职责边界说明

本次重构严格遵循 MVC 分层架构原则，明确了 Controller 和 Service 的职责边界，确保了代码的可维护性和测试性。

## 1. Controller 层职责
Controller 层仅负责处理 HTTP 请求的接收、参数解析、简单的输入验证，以及将 Service 层返回的结果封装为统一的 API 响应格式（`Result<T>`）。

**核心原则：**
- **禁止业务逻辑**：不进行复杂的条件判断、数据转换或业务计算。
- **禁止直接数据库访问**：移除所有直接注入的 Mapper 接口。
- **参数校验**：仅进行基本的 HTTP 参数校验（如 `@Valid`），复杂的业务校验下沉至 Service。
- **异常处理**：捕获特定异常并转换为对应的 HTTP 状态码或错误信息。

**主要变更：**
- `AssessmentController`：移除了 `AssessmentTemplateMapper`，所有模板管理逻辑迁移至 `AssessmentService`。
- `ContentController`：移除了 `CourseSourceMapper` 和 MyBatis-Plus Wrapper 构建逻辑，迁移至 `ArticleService` 和 `CourseService`。
- `UserController`：移除了用户脱敏和部分更新逻辑，迁移至 `UserService`。
- `AdminController`：移除了复杂的医生/医院/用户管理逻辑，拆分并迁移至 `HospitalService` 和 `UserService`。
- `DoctorController`：移除了直接查询关联表的逻辑，迁移至 `UserService`。

## 2. Service 层职责
Service 层负责核心业务逻辑的处理，包括数据验证、事务管理、复杂查询构建以及与其他服务的交互。

**核心原则：**
- **事务管理**：使用 `@Transactional` 注解确保数据一致性。
- **业务校验**：处理所有业务规则校验（如权限、状态检查）。
- **数据组装**：负责 DTO 到 Entity 的转换，以及 Entity 到 VO 的转换。
- **数据库交互**：通过 Mapper 接口与数据库交互，构建查询条件（Wrapper）。

**主要新增方法：**
- `IAssessmentService`：`getAdminTemplates`, `saveTemplate`, `deleteTemplate`
- `IArticleService`：`getArticleList`, `getAdminArticles`, `saveArticle`
- `ICourseService`：`getCourseList`, `getAdminCourses`, `saveCourseOld`
- `IUserService`：`getUserInfo`, `updateUserInfo`, `getPatientsByDoctorId`, `getUsers`, `saveUser`, `deleteUser`
- `IHospitalService`：`getHospitals`, `saveHospital`, `deleteHospital`, `getMyHospitalDoctors`, `saveDoctor`, `deleteDoctor`

## 3. 依赖注入规范
- Controller 只注入 Service。
- Service 注入 Mapper 或其他 Service。
- 推荐使用构造器注入（`@RequiredArgsConstructor`）代替字段注入（`@Autowired`）。
