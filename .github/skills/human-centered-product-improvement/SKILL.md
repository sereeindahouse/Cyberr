---
name: human-centered-product-improvement
description: 'Improve an existing product from a real user perspective. Use when reviewing a dashboard or web app for useful efficiency features, auditing existing workflows, prioritizing product improvements, implementing focused UX changes, or validating a feature end to end.'
argument-hint: 'Which product area or user workflow should be made more efficient?'
user-invocable: true
---

# Human-Centered Product Improvement

## Зорилго

Одоо байгаа бүтээгдэхүүнийг бүхэлд нь дахин бичихгүйгээр, бодит хэрэглэгчийн өдөр тутмын зорилгыг хурдан, ойлгомжтой, найдвартай биелүүлэхэд туслах хамгийн өндөр үнэ цэнтэй сайжруулалтыг олж хэрэгжүүлнэ. Feature-ийн тоо нэмэх нь зорилго биш; хэрэглэгчийн хийх ажилд гарах үрэлт, давталт, алдаа, эргэлзээг бууруулах нь зорилго.

## Хэзээ ашиглах вэ

- “Хэрэв би хэрэглэгч байсан бол юу нэмэх вэ?” гэж одоо байгаа апп-ыг дахин үнэлэх үед
- Dashboard, admin tool, operations tool, CRUD workflow, task manager, report system-ийг илүү үр ашигтай болгох үед
- Олон feature аль хэдийн байгаа ч хэрэглээний дараагийн хамгийн зөв алхам тодорхойгүй үед
- Одоо байгаа interaction-уудыг шалгаж, жижиг боловч өндөр нөлөөтэй UX сайжруулалт хийх үед
- Шинэ feature хэрэгжүүлсний дараа typecheck, test, build, runtime-ээр баталгаажуулах үед

## Үндсэн зарчим

1. Эхлээд хэрэглэгчийн хийх ажил, дараа нь UI feature-ийг тодорхойл.
2. Одоо байгаа кодын ownership, state, persistence, API boundary-г олж байж өөрчил.
3. Хэрэглэгчийн өгөгдлийг устгах, давхар үүсгэх, алдаатай хадгалах эрсдэлийг хамгийн түрүүнд хаа.
4. Давтагддаг үйлдлийг цөөлөх, зөв мэдээллийг зөв үед харуулах, буцаах боломжийг өгөхийг нэн тэргүүнд тавь.
5. Нэг том redesign-ийн оронд хамгийн бага хүрээнд хэмжигдэхүйц үр дүн өгөх өөрчлөлт хий.
6. Таамаглал бүрийг ойролцоох код, тест, call site, эсвэл ажиллаж буй UI-гаар шалга.
7. Холбогдохгүй эвдрэлийг засахгүй; хэрэглэгчийн хүсэлттэй холбоотой эрсдэлийг л хамар.

## Ажлын дараалал

### 1. Хэрэглэгчийн ажлыг тодорхойлох

Хүсэлтийг дараах хэлбэрээр буулга:

- **Хэрэглэгч:** энэ дэлгэцийг хэн, ямар давтамжаар ашиглах вэ?
- **Зорилго:** хэрэглэгч яг ямар үр дүнд хүрэх ёстой вэ?
- **Одоогийн үрэлт:** хаана олон click, дахин бичилт, хайлт, хүлээлт, эргэлзээ, алдаа гарч байна вэ?
- **Амжилтын хэмжүүр:** click-ийн тоо, хугацаа, алдааны магадлал, мэдээлэл олох хурд, эсвэл төлөвийн ил тод байдал хэрхэн сайжрах вэ?

Хэрэв хэрэглэгчийн ажил тодорхойгүй бол эхлээд асуулт асуу. Хэрэв хүсэлт тодорхой бөгөөд кодын контекст хангалттай бол асуултаар зогсолгүй хамгийн боломжит workflow-г сонгож, таамаглалаа ил тод бич.

### 2. Кодын бодит замыг олох

Дараах хамгийн ойрын эхлэлээс унш:

1. Хамаарах page, component, route эсвэл failing test
2. Түүний state, event handler, derived data
3. Persistence/API/trpc/server boundary
4. Ойролцоох test болон хэрэглэж буй call site
5. Холбогдох styling, responsive layout, empty/loading/error state

Энэ шатанд бүх repository-г замбараагүй нээхгүй. Нэг falsifiable hypothesis, түүнийг үгүйсгэх нэг хямд check, хамгийн бага засварын цэгийг тодорхойл. Жишээ: “Хэрэглэгчийн давтагддаг report үйлдэл нь одоо нэг бүрчлэн нээгддэг тул bulk action хамгийн их үр ашиг өгнө; үүнийг одоо байгаа selection state эсвэл persistence contract дэмжиж байгаа эсэхээр шалгана.”

### 3. Боломжит сайжруулалтыг эрэмбэлэх

Санаа бүрийг дараах дөрвөн шалгуураар үнэл:

- **Нөлөө:** хэрэглэгчийн давтамжтай, гол workflow-г хэр их хурдлуулах вэ?
- **Итгэлтэй байдал:** код, тест, хэрэглээний логикоор баталгаажсан уу?
- **Хэрэгжүүлэх өртөг:** өөрчлөлтийн хэмжээ, шинэ dependency, migration-ийн эрсдэл
- **Эвдрэх эрсдэл:** өгөгдөл, auth, persistence, responsive UI-д нөлөөлөх үү?

Их нөлөө, өндөр итгэлтэй, бага/дунд өртөгтэй, бага эрсдэлтэй санааг сонго. Эдгээрээс дор хаяж нэгийг давуугаар авч үз:

- Хурдан хайх, шүүх, эрэмбэлэх, keyboard shortcut
- Олон зүйл дээр нэгэн зэрэг хийх үйлдэл болон баталгаатай undo
- Draft/autosave, тодорхой loading/success/error feedback
- Empty, stale, offline, permission, validation төлөвүүд
- Дараагийн алхмыг шууд хэлдэг context-aware action
- Хэрэглэгчийн төлөв, сонголтыг дахин ачаалсны дараа хадгалах
- Давхар submit, accidental delete, stale update-ээс хамгаалах

### 4. Хэрэгжүүлэхийн өмнө contract тогтоох

Дараах асуултад хариулж байж edit хий:

- Feature-ийн single source of truth аль state эсвэл server record вэ?
- Нэг хэрэглэгчийн action амжилтгүй болбол UI ямар төлөвт үлдэх вэ?
- Optimistic update хийх үү, эсвэл server confirmation хүлээх үү?
- Refresh, navigation, duplicate click, slow network үед юу болох вэ?
- Delete/archive гэх мэт буцаахад хэцүү үйлдэл confirmation эсвэл undo-той юу?
- Existing types, API input, database constraint-ийг өөрчлөх шаардлагатай юу?
- Mobile болон keyboard хэрэглэгч энэ үйлдэлд хүрч чадах уу?

### 5. Хамгийн бага, бүрэн өөрчлөлт хийх

- Одоо байгаа component, helper, design system, icon, modal, toast pattern-ийг ашигла.
- Нэг feature-ийн бүх төлөвийг хамар: idle, hover/focus, loading, success, error, empty, disabled, permission denied.
- Text нь тухайн action-ийн үр дүнг тодорхой хэлнэ; generic “Done” гэхээс зайлсхий.
- Button-ийн давхар даралт, form submit, keyboard interaction, focus management-ийг шалга.
- Responsive layout-д fixed width/height-аас үүдэх overflow, overlap, текст тасралыг шалга.
- Шинэ abstraction зөвхөн бодит duplication эсвэл complexity-г бууруулж байвал нэм.
- Unrelated refactor, dependency upgrade, mass formatting бүү хий.

### 6. Focused validation хийх

Эхний substantive edit-ийн дараагийн алхам заавал хамгийн хямд, хамгийн discriminating executable check байна:

1. Хүрсэн slice-ийн test эсвэл failing behavior check
2. Тухайн файл/feature-ийн typecheck эсвэл lint
3. Хэрэглэгчийн гол happy path болон error path-ийн runtime шалгалт
4. Responsive болон keyboard interaction-ийн шалгалт
5. Дараа нь project-ийн өргөн хүрээний test, build

Vite/TypeScript төсөлд repository-ийн package script-үүдийг эхэлж шалга. Ихэвчлэн `pnpm check`, `pnpm test`, `pnpm build` дарааллыг ашиглаж болно. Windows PowerShell-д Unix-ийн `head`, `tail`, `&&`-д найдахгүй; тухайн орчны зөв синтакс ашигла.

Validation бүрийн дараа:

- Шинэ алдаа гарсан эсэхийг ялга
- Хэрэв одоогийн hypothesis дэмжигдвэл тэр slice-ийг шууд засаж, ижил check-ийг дахин ажиллуул
- Hypothesis буруу бол нэг ойрын hop хийж behavior-ийг үнэхээр удирдаж буй код руу шилж
- Бүх шалгалтыг өргөжүүлэхээс өмнө хүрсэн feature-ийн behavior-ийг батал

### 7. Хүний хэрэглээний эцсийн шалгалт

Feature ажиллаж байгаа нь хангалтгүй. Дараахыг гараар төсөөлж эсвэл browser-аар шалга:

- Анх удаа орж буй хүн юу хийхээ шууд ойлгох уу?
- Давтамжтай хэрэглэгчийн click болон бичилт үнэхээр цөөрсөн үү?
- Алдаа гарвал өгөгдөл алдагдахгүй, дараагийн алхам тодорхой юу?
- Хэрэглэгч хийсэн action-ын үр дүнг шууд мэдэх үү?
- Back, refresh, reload, slow response үед төлөв алдагдах уу?
- Empty state нь мухардал биш, дараагийн бодит action санал болгож байна уу?
- Гар, keyboard-only, жижиг дэлгэц, урт тексттэй үед ашиглаж болох уу?
- Шинэ feature өмнөх report/task/calendar/playbook урсгалтай зөрчилдөхгүй юу?

## Дууссан гэж үзэх шалгуур

Дараах бүх нөхцөл биелсэн үед task-ийг дууссан гэж үз:

- Сонгосон feature нь тодорхой хэрэглэгчийн үрэлтийг бууруулдаг
- Өөрчлөлтийн controlling code path болон data contract ойлгомжтой
- Happy path, empty/loading/error/disabled төлөвүүд хэрэгжсэн
- Destructive action хамгаалагдсан, боломжтой бол буцаах замтай
- Mobile болон keyboard interaction шалгагдсан
- Ойролцоох focused validation амжилттай
- Project-ийн боломжит test/typecheck/build амжилттай, эсвэл blocker-ийг тодорхой тэмдэглэсэн
- Unrelated code өөрчлөгдөөгүй
- Final summary-д ямар хэрэглэгчийн асуудлыг, ямар өөрчлөлтөөр, ямар check-ээр шийдсэнийг хэлсэн

## Хариуны бүтэц

Ажил эхлэхдээ богинохон:

1. Одоогийн workflow-оос олсон хэрэглэгчийн асуудал
2. Үүнийг шалгах falsifiable hypothesis
3. Сонгосон жижиг өөрчлөлт ба яагаад хамгийн өндөр үнэ цэнтэй гэж үзсэн шалтгаан

Ажил дуусахдаа:

- Хэрэгжүүлсэн өөрчлөлт
- Хэрэглэгчид өгч буй бодит ашиг
- Шалгасан command/test болон үр дүн
- Үлдсэн эрсдэл, test gap, эсвэл дараагийн хамгийн үнэ цэнтэй сайжруулалт

## Жишээ prompt-ууд

- “Энэ dashboard-ийг өдөр бүр ашигладаг operator-ийн өнцгөөс шалгаад хамгийн их цаг хэмнэх нэг feature-ийг хэрэгжүүл.”
- “Report-уудыг нэг бүрчлэн засахын оронд давтагддаг ажлыг цөөлөх боломжийг олж, хамгийн бага өөрчлөлтөөр хий.”
- “Одоо байгаа task workflow дээр алдаа гарсан үед өгөгдөл алдагдахгүй, дараагийн алхам тодорхой болго.”
- “Энэ UI-ийн mobile, keyboard, loading, empty, error төлөвүүдийг хүний хэрэглээний өнцгөөс audit хийгээд өндөр нөлөөтэй асуудлыг зас.”
