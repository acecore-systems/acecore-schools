export const defaultLocale = "ja" as const;

export const locales = [
  "ja",
  "en",
  "zh-cn",
  "es",
  "pt",
  "fr",
  "ko",
  "de",
  "ru",
] as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
  "zh-cn": "简体中文",
  es: "Español",
  pt: "Português",
  fr: "Français",
  ko: "한국어",
  de: "Deutsch",
  ru: "Русский",
};

export const htmlLangMap: Record<Locale, string> = {
  ja: "ja",
  en: "en",
  "zh-cn": "zh-CN",
  es: "es",
  pt: "pt",
  fr: "fr",
  ko: "ko",
  de: "de",
  ru: "ru",
};

export const schoolsContent = {
  ja: {
    title: "Acecore Schools",
    description:
      "Acecore Schoolsは、学習塾・ロボットプログラミング・実践プログラミング・パソコン/スマホ・高卒認定など幅広い教育プログラムを提供するITスクールです。",
    heroTitle: "Acecore Schools",
    heroSubtitle: "一人ひとりに合わせた指導で、確かなスキルを",
    heroImgAlt: "教室での学習風景",
    learningFlowEyebrow: "Learning Flow",
    learningFlowTitle: "Acecore Schoolsの学びを流れで見る",
    learningFlowDesc:
      "興味の入口から実践、継続までを一本の学習導線として見せています。",
    intro:
      "お子さまから大人の方まで、一人ひとりの目標やペースに合わせた個別指導を行っています。サービス一覧での位置づけもご覧いただけます。",
    juku: {
      title: "学習塾",
      desc: "私たちの学習塾では、一人ひとりの生徒に合わせた指導を行い、基礎から応用までの学力を身につけることができます。経験豊富な講師陣が、生徒の成長をサポートします。",
      featuresLabel: "特徴",
      imgAlt: "教室での個別指導の様子",
      features: [
        "個別指導で一人ひとりの理解度に合わせた丁寧な授業",
        "基礎の定着から応用力の養成まで段階的にサポート",
        "定期テスト・受験対策にも対応",
      ],
    },
    robotProgramming: {
      title: "ロボット / プログラミング",
      desc: "最先端の技術を取り入れたロボットプログラミングの授業を提供しています。実際のロボットを使用して、プログラミングの基礎を学ぶことができます。",
      imgAlt: "プログラミング学習に取り組む生徒",
      progImgAlt: "プログラミング学習のイメージ",
      courses: [
        {
          title: "ロボットコース",
          description:
            "タミヤ工作シリーズなどを使用した実際のロボット工作を通じて、ものづくりの楽しさと基本的な仕組みを学びます。",
        },
        {
          title: "ロボット プログラミングコース",
          description:
            "ロボットをプログラムで制御する技術を学びます。センサーやモーターの制御を通じて、論理的思考力を育みます。",
        },
        {
          title: "マインクラフトプログラミングコース",
          description:
            "マインクラフトの世界でプログラミングの基礎を楽しく学びます。ゲーム感覚で論理的思考力を養います。",
        },
      ],
    },
    compareTitle: "学び方の違い",
    compareBefore: "独学の場合",
    compareAfter: "Acecore Schools",
    practicalProgramming: {
      title: "実践プログラミング",
      desc: "実際の業務で使用されるプログラミング技術を学ぶことができるカリキュラムを提供しています。実践的なスキルを身につけることで、即戦力として活躍できます。",
      contentLabel: "学べる内容",
      contentsLabel: "学習内容",
      contents: [
        "HTML / CSS / JavaScript によるWebフロントエンド開発",
        "Python / Node.js などを使ったバックエンド開発",
        "データベース設計・API構築・クラウド活用",
        "Git / チーム開発のワークフロー",
      ],
    },
    pcSmartphone: {
      title: "パソコン / スマホ",
      desc: "日常生活やビジネスシーンで必要とされるパソコン・スマホの操作技術を学ぶことができます。初心者から上級者まで、幅広いレベルの授業を提供しています。",
      levelLabel: "対応レベル",
      imgAlt: "パソコンで学習する受講生",
      levelsLabel: "対応レベル",
      levels: [
        "パソコン・スマホの基本操作（初心者歓迎）",
        "Word / Excel / PowerPoint などオフィスソフトの活用",
        "メール・SNS・オンライン会議のセットアップと使い方",
        "セキュリティ対策・トラブルシューティング",
      ],
    },
    ged: {
      title: "高卒認定",
      desc: "高等学校を卒業していない方を対象とした、高卒認定試験の対策授業を行っています。専門的な知識や技術を身につけ、高卒の資格を取得するサポートをします。",
      supportLabel: "サポート内容",
      supports: [
        "各科目ごとの試験対策（国語・数学・英語・社会・理科）",
        "個人の学力に合わせた学習計画の作成",
        "模擬試験・過去問演習による実践的な対策",
      ],
    },
    pricing: {
      title: "授業料の目安",
      body: "受講前に費用感を確認できるよう、月謝・入会金・教材費の目安を掲載しています。金額は税込目安で、学年、週回数、教材、受講内容により変動します。",
      ctaHeading: "詳しい費用はお気軽にご相談ください",
      ctaBody:
        "学年、目的、通える回数を伺い、無理のない学習プランと費用感を整理します。",
      ctaPricing: "料金一覧を見る",
      ctaContact: "問い合わせる",
      items: [
        {
          icon: "log-in",
          label: "入会金",
          price: "1.1万〜2.2万円",
          note: "初回のみ。学年やコースにより変動します。",
        },
        {
          icon: "calendar-days",
          label: "月謝",
          price: "8千〜3.3万円",
          note: "週回数、授業時間、個別指導内容により変動します。",
        },
        {
          icon: "book-open",
          label: "教材・管理費",
          price: "5千〜3万円程度",
          note: "教材、ロボット部材、PC/ライセンス費などは内容により実費が発生します。",
        },
      ],
    },
    ctaHeading: "お問い合わせ・お申し込み",
    ctaBody:
      "各コースの詳細やお申し込みは、お問い合わせフォームまたはLINEからご相談ください。「どのコースが合うか分からない」という内容でも大丈夫です。",
    ctaForm: "お問い合わせフォーム",
    ctaLine: "LINEで問い合わせる",
    learningSteps: [
      {
        title: "興味を見つける",
        description: "学習塾やロボット体験を通して、学ぶ入口を個別に探します。",
        icon: "sparkles",
        accent: "amber",
      },
      {
        title: "手を動かして理解する",
        description:
          "実機、マインクラフト、プログラミング演習で体験と理解を結び付けます。",
        icon: "bot",
        accent: "brand",
      },
      {
        title: "実践に接続する",
        description:
          "Web開発やツール活用など、現実の課題に使える学びへ引き上げます。",
        icon: "code-xml",
        accent: "emerald",
      },
      {
        title: "継続できる形にする",
        description:
          "受験、資格、日常のIT活用まで含めて、本人に合う継続導線を作ります。",
        icon: "flag",
        accent: "slate",
      },
    ],
    compareBeforeItems: [
      "何から始めればいいか迷う",
      "つまずいても相談できない",
      "モチベーション維持が難しい",
      "実践との接続が見えない",
    ],
    compareAfterItems: [
      "一人ひとりに合った入口を提案",
      "講師にいつでも質問できる",
      "体験を通じて自然に継続",
      "受験・資格・実務に直結",
    ],
  },
  en: {
    title: "Acecore Schools",
    description:
      "Acecore Schools is an IT school offering a wide range of educational programs including tutoring, robot programming, practical programming, PC/smartphone classes, and high school equivalency exam preparation.",
    heroTitle: "Acecore Schools",
    heroSubtitle: "Personalized instruction for solid skills",
    heroImgAlt: "Classroom learning scene",
    learningFlowEyebrow: "Learning Flow",
    learningFlowTitle: "See the Acecore Schools learning journey",
    learningFlowDesc:
      "From initial interest to practice and continuity — presented as a single learning path.",
    intro:
      "We provide personalized instruction tailored to each student's goals and pace, from children to adults. You can also see where we fit in our services overview.",
    juku: {
      title: "Tutoring",
      desc: "Our tutoring program provides personalized instruction tailored to each student, building academic skills from fundamentals to advanced applications. Experienced instructors support every student's growth.",
      featuresLabel: "Features",
      imgAlt: "Individual tutoring session in a classroom",
      features: [
        "Personalized lessons tailored to each student's level of understanding",
        "Step-by-step support from foundational skills to advanced application",
        "Test prep and entrance exam preparation available",
      ],
    },
    robotProgramming: {
      title: "Robot / Programming",
      desc: "We offer cutting-edge robot programming classes. Students can learn programming fundamentals using actual robots.",
      imgAlt: "Student engaged in programming learning",
      progImgAlt: "Programming learning image",
      courses: [
        {
          title: "Robot Course",
          description:
            "Learn the joy of making and basic mechanisms through hands-on robot building using kits like the Tamiya craft series.",
        },
        {
          title: "Robot Programming Course",
          description:
            "Learn to control robots with programming. Develop logical thinking through sensor and motor control.",
        },
        {
          title: "Minecraft Programming Course",
          description:
            "Learn programming basics in the world of Minecraft. Develop logical thinking through game-based learning.",
        },
      ],
    },
    compareTitle: "Comparing Learning Approaches",
    compareBefore: "Self-study",
    compareAfter: "Acecore Schools",
    practicalProgramming: {
      title: "Practical Programming",
      desc: "We offer a curriculum for learning programming skills used in actual business environments. Gain practical skills to hit the ground running.",
      contentLabel: "What You'll Learn",
      contentsLabel: "Course Contents",
      contents: [
        "Web frontend development with HTML / CSS / JavaScript",
        "Backend development with Python / Node.js",
        "Database design, API development, and cloud utilization",
        "Git and team development workflows",
      ],
    },
    pcSmartphone: {
      title: "PC / Smartphone",
      desc: "Learn computer and smartphone skills needed for daily life and business. We offer classes for all levels, from beginners to advanced users.",
      levelLabel: "Supported Levels",
      imgAlt: "Student learning on a computer",
      levelsLabel: "Supported Levels",
      levels: [
        "Basic PC and smartphone operation (beginners welcome)",
        "Office software: Word / Excel / PowerPoint",
        "Email, SNS, and online meeting setup and usage",
        "Security measures and troubleshooting",
      ],
    },
    ged: {
      title: "High School Equivalency",
      desc: "We offer preparation classes for the high school equivalency exam for those who haven't graduated high school. We support you in gaining the knowledge and qualifications needed.",
      supportLabel: "Support Content",
      supports: [
        "Subject-specific exam preparation (Japanese, math, English, social studies, science)",
        "Personalized study plans based on individual academic level",
        "Practice exams and past paper exercises for practical preparation",
      ],
    },
    ctaHeading: "Inquiries & Enrollment",
    ctaBody:
      "For course details and enrollment, please use the contact form or LINE. It is fine to ask even if you are not sure which course is right.",
    ctaForm: "Contact Form",
    ctaLine: "Contact via LINE",
    pricing: {
      title: "Tuition Guide",
      body: "These tax-included estimates show tuition, admission, and materials fees before enrollment. Costs vary by grade, frequency, materials, and course content.",
      ctaHeading: "Contact us for detailed school costs.",
      ctaBody:
        "We will ask about grade, goals, and available frequency, then organize a realistic learning plan and cost range.",
      ctaPricing: "View Pricing Guide",
      ctaContact: "Contact Us",
      items: [
        {
          icon: "log-in",
          label: "Admission fee",
          price: "¥11,000-¥22,000",
          note: "One-time fee. Varies by grade and course.",
        },
        {
          icon: "calendar-days",
          label: "Monthly tuition",
          price: "¥8,000-¥33,000",
          note: "Varies by weekly frequency, lesson time, and individual instruction content.",
        },
        {
          icon: "book-open",
          label: "Materials / management fees",
          price: "Around ¥5,000-¥30,000",
          note: "Materials, robot parts, PC/license fees, and similar costs may be charged separately depending on the course.",
        },
      ],
    },
    learningSteps: [
      {
        title: "Find Your Interest",
        description:
          "Through tutoring and robot experiences, we help find each student's entry point to learning.",
        icon: "sparkles",
        accent: "amber",
      },
      {
        title: "Learn by Doing",
        description:
          "Connect experience and understanding through hands-on work with robots, Minecraft, and coding exercises.",
        icon: "bot",
        accent: "brand",
      },
      {
        title: "Connect to Practice",
        description:
          "Elevate learning to real-world problem solving through web development and tool utilization.",
        icon: "code-xml",
        accent: "emerald",
      },
      {
        title: "Make It Sustainable",
        description:
          "Create a continuity path that fits each student, including exams, certifications, and everyday IT use.",
        icon: "flag",
        accent: "slate",
      },
    ],
    compareBeforeItems: [
      "Don't know where to start",
      "No one to consult when stuck",
      "Hard to stay motivated",
      "Can't see the connection to practice",
    ],
    compareAfterItems: [
      "Personalized entry point suggestions",
      "Ask instructors anytime",
      "Natural continuity through hands-on experience",
      "Directly connected to exams, certifications, and real work",
    ],
  },
  "zh-cn": {
    robotProgramming: {
      progImgAlt: "编程学习图片",
      title: "机器人 / 编程",
      desc: "我们提供融合先进技术的机器人编程课程。学生可以使用实际的机器人学习编程基础。",
      imgAlt: "学习编程的学生",
      courses: [
        {
          title: "机器人课程",
          description:
            "通过使用田宫工作套件等进行实际的机器人制作，学习制造的乐趣和基本原理。",
        },
        {
          title: "机器人编程课程",
          description:
            "学习通过编程控制机器人的技术。通过传感器和电机控制培养逻辑思维能力。",
        },
        {
          title: "我的世界编程课程",
          description:
            "在我的世界中快乐地学习编程基础。通过游戏培养逻辑思维能力。",
        },
      ],
    },
    practicalProgramming: {
      contentsLabel: "学习内容",
      title: "实践编程",
      desc: "我们提供学习实际业务中使用的编程技术的课程。掌握实践技能，让学员能够即刻独当一面。",
      contentLabel: "学习内容",
      contents: [
        "使用 HTML / CSS / JavaScript 进行Web前端开发",
        "使用 Python / Node.js 等进行后端开发",
        "数据库设计、API构建和云服务应用",
        "Git和团队开发工作流",
      ],
    },
    pcSmartphone: {
      levelsLabel: "支持级别",
      title: "电脑 / 智能手机",
      desc: "学习日常生活和商务场景中所需的电脑和智能手机操作技能。为从初学者到高级用户提供全方位课程。",
      levelLabel: "适用级别",
      imgAlt: "使用电脑学习的学员",
      levels: [
        "电脑和智能手机基本操作（欢迎初学者）",
        "办公软件：Word / Excel / PowerPoint 的使用",
        "邮件、社交媒体和在线会议的设置与使用",
        "安全防护和故障排除",
      ],
    },
    title: "Acecore Schools",
    description:
      "Acecore Schools是一所IT学校，提供学习辅导、机器人编程、实践编程、电脑/智能手机课程和高中同等学力考试准备等广泛的教育项目。",
    heroTitle: "Acecore Schools",
    heroSubtitle: "个性化指导，培养扎实技能",
    heroImgAlt: "教室学习场景",
    learningFlowEyebrow: "Learning Flow",
    learningFlowTitle: "了解Acecore Schools的学习流程",
    learningFlowDesc: "从兴趣入门到实践再到持续学习——以一条学习路径展现。",
    intro:
      "我们为从儿童到成人的学员提供个性化指导，根据每个人的目标和节奏量身定制。您也可以在服务一览中了解我们的定位。",
    juku: {
      title: "学习辅导",
      desc: "我们的辅导课程为每位学生提供个性化指导，从基础到应用，培养全面的学习能力。经验丰富的讲师全力支持每位学生的成长。",
      featuresLabel: "特色",
      imgAlt: "教室个别辅导场景",
      features: [
        "根据每位学生的理解程度提供个别辅导",
        "从基础巩固到应用能力培养的阶段性支持",
        "支持定期考试和升学考试备考",
      ],
    },
    compareTitle: "学习方式对比",
    compareBefore: "自学",
    compareAfter: "Acecore Schools",
    ged: {
      title: "高中同等学力考试",
      desc: "为未高中毕业者提供高中同等学力考试备考课程。帮助掌握专业知识和技能，获取高中同等资格。",
      supportLabel: "支持内容",
      supports: [
        "各科目考试对策（语文、数学、英语、社会、理科）",
        "根据个人学力制定学习计划",
        "模拟考试和历年真题训练",
      ],
    },
    ctaHeading: "咨询与报名",
    ctaBody:
      "课程详情和报名请通过联系表单或 LINE 咨询。即使不确定哪个课程适合，也可以直接询问。",
    ctaForm: "咨询表单",
    ctaLine: "通过LINE咨询",
    pricing: {
      title: "学费参考",
      body: "为了在报名前确认费用感，我们公开月费、入会金和教材费的参考。金额为含税预估，会根据年级、次数、教材和课程内容变动。",
      ctaHeading: "详细费用欢迎咨询。",
      ctaBody: "我们会了解年级、目标和可上课次数，整理合适的学习计划与费用感。",
      ctaPricing: "查看费用参考",
      ctaContact: "联系我们",
      items: [
        {
          icon: "log-in",
          label: "入会金",
          price: "1.1万〜2.2万日元",
          note: "仅首次发生。会根据年级和课程变动。",
        },
        {
          icon: "calendar-days",
          label: "月费",
          price: "8千〜3.3万日元",
          note: "会根据每周次数、课时和个别指导内容变动。",
        },
        {
          icon: "book-open",
          label: "教材与管理费",
          price: "约5千〜3万日元",
          note: "教材、机器人零件、PC/许可证等会根据内容产生实际费用。",
        },
      ],
    },
    learningSteps: [
      {
        title: "发现兴趣",
        description: "通过辅导和机器人体验，为每位学生找到学习的入口。",
        icon: "sparkles",
        accent: "amber",
      },
      {
        title: "动手理解",
        description: "通过机器人实操、我的世界和编程练习，将体验与理解结合。",
        icon: "bot",
        accent: "brand",
      },
      {
        title: "连接实践",
        description: "通过Web开发和工具运用，将学习提升到解决实际问题的层面。",
        icon: "code-xml",
        accent: "emerald",
      },
      {
        title: "持续学习",
        description:
          "涵盖升学考试、资格证书和日常IT应用，为每位学员打造适合的持续学习路径。",
        icon: "flag",
        accent: "slate",
      },
    ],
    compareBeforeItems: [
      "不知道从何开始",
      "遇到困难无人可问",
      "难以保持学习动力",
      "看不到与实际应用的联系",
    ],
    compareAfterItems: [
      "根据个人情况推荐入门方式",
      "随时可以向讲师提问",
      "通过体验自然地持续学习",
      "直接对接升学、资格考试和实务",
    ],
  },
  es: {
    robotProgramming: {
      progImgAlt: "Imagen de aprendizaje de programación",
      title: "Robot / Programación",
      desc: "Ofrecemos clases de programación con robots de última tecnología. Los estudiantes pueden aprender los fundamentos de la programación usando robots reales.",
      imgAlt: "Estudiante aprendiendo programación",
      courses: [
        {
          title: "Curso de Robots",
          description:
            "Aprende la alegría de crear y los mecanismos básicos a través de la construcción práctica de robots con kits como la serie Tamiya.",
        },
        {
          title: "Curso de Programación de Robots",
          description:
            "Aprende a controlar robots con programación. Desarrolla el pensamiento lógico mediante el control de sensores y motores.",
        },
        {
          title: "Curso de Programación con Minecraft",
          description:
            "Aprende los fundamentos de la programación en el mundo de Minecraft. Desarrolla el pensamiento lógico a través del aprendizaje lúdico.",
        },
      ],
    },
    practicalProgramming: {
      contentsLabel: "Contenidos del Curso",
      title: "Programación Práctica",
      desc: "Ofrecemos un currículo para aprender técnicas de programación usadas en entornos laborales reales. Adquiere habilidades prácticas para ser productivo de inmediato.",
      contentLabel: "Contenido",
      contents: [
        "Desarrollo frontend web con HTML / CSS / JavaScript",
        "Desarrollo backend con Python / Node.js",
        "Diseño de bases de datos, construcción de API y uso de la nube",
        "Git y flujos de trabajo en equipo",
      ],
    },
    pcSmartphone: {
      levelsLabel: "Niveles Compatibles",
      title: "PC / Smartphone",
      desc: "Aprende las habilidades de PC y smartphone necesarias para la vida diaria y los negocios. Ofrecemos clases para todos los niveles.",
      levelLabel: "Niveles disponibles",
      imgAlt: "Estudiante aprendiendo con un ordenador",
      levels: [
        "Operación básica de PC y smartphone (principiantes bienvenidos)",
        "Software de oficina: Word / Excel / PowerPoint",
        "Configuración y uso de correo, redes sociales y reuniones online",
        "Medidas de seguridad y resolución de problemas",
      ],
    },
    title: "Acecore Schools",
    description:
      "Acecore Schools es una escuela IT que ofrece programas educativos amplios: tutoría, programación con robots, programación práctica, clases de PC/smartphone y preparación para equivalencia de bachillerato.",
    heroTitle: "Acecore Schools",
    heroSubtitle: "Instrucción personalizada para habilidades sólidas",
    heroImgAlt: "Escena de aprendizaje en el aula",
    learningFlowEyebrow: "Learning Flow",
    learningFlowTitle: "Descubre el proceso de aprendizaje de Acecore Schools",
    learningFlowDesc:
      "Desde el interés inicial hasta la práctica y la continuidad, presentado como una ruta de aprendizaje.",
    intro:
      "Ofrecemos instrucción personalizada adaptada a los objetivos y ritmo de cada estudiante, desde niños hasta adultos. También puede ver nuestra posición en la visión general de servicios.",
    juku: {
      title: "Tutoría",
      desc: "Nuestro programa de tutoría ofrece instrucción personalizada para cada estudiante, desarrollando habilidades académicas desde los fundamentos hasta la aplicación avanzada. Instructores experimentados apoyan el crecimiento de cada alumno.",
      featuresLabel: "Características",
      imgAlt: "Sesión de tutoría individual en el aula",
      features: [
        "Lecciones personalizadas según el nivel de comprensión de cada estudiante",
        "Apoyo gradual desde la consolidación de bases hasta el desarrollo de habilidades avanzadas",
        "Preparación para exámenes regulares y de ingreso",
      ],
    },
    compareTitle: "Comparación de métodos de aprendizaje",
    compareBefore: "Autoestudio",
    compareAfter: "Acecore Schools",
    ged: {
      title: "Equivalencia de Bachillerato",
      desc: "Ofrecemos clases de preparación para el examen de equivalencia de bachillerato para quienes no se graduaron de la escuela secundaria.",
      supportLabel: "Contenido de apoyo",
      supports: [
        "Preparación por asignatura (lengua, matemáticas, inglés, ciencias sociales, ciencias)",
        "Planes de estudio personalizados según el nivel académico",
        "Exámenes de práctica y ejercicios con exámenes anteriores",
      ],
    },
    ctaHeading: "Consultas e inscripción",
    ctaBody:
      "Para detalles de cursos e inscripción, use el formulario de contacto o LINE. También puede consultar aunque no sepa qué curso elegir.",
    ctaForm: "Formulario de contacto",
    ctaLine: "Contactar por LINE",
    pricing: {
      title: "Rangos de cuotas",
      body: "Para que pueda revisar el coste antes de inscribirse, publicamos rangos de mensualidad, matrícula y materiales. Son estimaciones con impuestos incluidos y pueden variar por curso, frecuencia, materiales y contenido.",
      ctaHeading: "Consulte el coste detallado cuando quiera.",
      ctaBody:
        "Revisamos curso, objetivo y frecuencia posible para proponer un plan de estudio y un coste realista.",
      ctaPricing: "Ver guía de precios",
      ctaContact: "Contactar",
      items: [
        {
          icon: "log-in",
          label: "Matrícula",
          price: "¥11.000-¥22.000",
          note: "Solo al inicio. Puede variar según curso y programa.",
        },
        {
          icon: "calendar-days",
          label: "Mensualidad",
          price: "¥8.000-¥33.000",
          note: "Varía según frecuencia, duración de clase y nivel de atención individual.",
        },
        {
          icon: "book-open",
          label: "Materiales y gestión",
          price: "aprox. ¥5.000-¥30.000",
          note: "Materiales, piezas de robótica, PC o licencias pueden generar costes reales adicionales según el contenido.",
        },
      ],
    },
    learningSteps: [
      {
        title: "Descubrir intereses",
        description:
          "A través de tutoría y experiencias con robots, encontramos el punto de entrada al aprendizaje de cada estudiante.",
        icon: "sparkles",
        accent: "amber",
      },
      {
        title: "Aprender haciendo",
        description:
          "Conectar experiencia y comprensión mediante robots, Minecraft y ejercicios de programación.",
        icon: "bot",
        accent: "brand",
      },
      {
        title: "Conectar con la práctica",
        description:
          "Elevar el aprendizaje a la resolución de problemas reales mediante desarrollo web y uso de herramientas.",
        icon: "code-xml",
        accent: "emerald",
      },
      {
        title: "Hacerlo sostenible",
        description:
          "Crear una ruta de continuidad que incluya exámenes, certificaciones y uso cotidiano de IT.",
        icon: "flag",
        accent: "slate",
      },
    ],
    compareBeforeItems: [
      "No sé por dónde empezar",
      "Nadie a quien consultar cuando me atasco",
      "Difícil mantener la motivación",
      "No veo la conexión con la práctica",
    ],
    compareAfterItems: [
      "Sugerencias de entrada personalizadas",
      "Consulta con instructores en cualquier momento",
      "Continuidad natural a través de la experiencia",
      "Conexión directa con exámenes, certificaciones y trabajo real",
    ],
  },
  pt: {
    robotProgramming: {
      progImgAlt: "Imagem de aprendizado de programação",
      title: "Robótica / Programação",
      desc: "Oferecemos aulas de ponta em programação de robôs. Os alunos podem aprender fundamentos de programação usando robôs reais.",
      imgAlt: "Aluno engajado em aprendizado de programação",
      courses: [
        {
          title: "Curso de Robótica",
          description:
            "Aprenda o prazer de criar e mecanismos básicos através da montagem prática de robôs usando kits como a série Tamiya.",
        },
        {
          title: "Curso de Programação de Robôs",
          description:
            "Aprenda a controlar robôs com programação. Desenvolva pensamento lógico através do controle de sensores e motores.",
        },
        {
          title: "Curso de Programação com Minecraft",
          description:
            "Aprenda os fundamentos da programação no mundo do Minecraft. Desenvolva o raciocínio lógico através da aprendizagem lúdica.",
        },
      ],
    },
    practicalProgramming: {
      contentsLabel: "Conteúdos do Curso",
      title: "Programação Prática",
      desc: "Oferecemos um currículo para aprender habilidades de programação usadas em ambientes empresariais reais. Adquira habilidades práticas para atuar imediatamente.",
      contentLabel: "O Que Você Aprenderá",
      contents: [
        "Desenvolvimento web frontend com HTML / CSS / JavaScript",
        "Desenvolvimento backend com Python / Node.js",
        "Design de banco de dados, desenvolvimento de API e utilização de cloud",
        "Git e fluxos de trabalho de desenvolvimento em equipe",
      ],
    },
    pcSmartphone: {
      levelsLabel: "Níveis Suportados",
      title: "PC / Smartphone",
      desc: "Aprenda habilidades de computador e smartphone necessárias para a vida diária e negócios. Oferecemos aulas para todos os níveis, de iniciantes a avançados.",
      levelLabel: "Níveis Suportados",
      imgAlt: "Aluno aprendendo no computador",
      levels: [
        "Operação básica de PC e smartphone (iniciantes são bem-vindos)",
        "Software de escritório: Word / Excel / PowerPoint",
        "Configuração e uso de e-mail, redes sociais e reuniões online",
        "Medidas de segurança e solução de problemas",
      ],
    },
    title: "Acecore Schools",
    description:
      "A Acecore Schools é uma escola de TI que oferece uma ampla variedade de programas educacionais incluindo tutoria, programação de robôs, programação prática, aulas de PC/smartphone e preparação para equivalência do ensino médio.",
    heroTitle: "Acecore Schools",
    heroSubtitle: "Instrução personalizada para habilidades sólidas",
    heroImgAlt: "Cena de aprendizado em sala de aula",
    learningFlowEyebrow: "Learning Flow",
    learningFlowTitle: "Conheça a jornada de aprendizado da Acecore Schools",
    learningFlowDesc:
      "Do interesse inicial à prática e continuidade — apresentado como um caminho único de aprendizado.",
    intro:
      "Oferecemos instrução personalizada adaptada aos objetivos e ritmo de cada aluno, de crianças a adultos. Você também pode ver nosso posicionamento na visão geral de serviços.",
    juku: {
      title: "Tutoria",
      desc: "Nosso programa de tutoria oferece instrução personalizada adaptada a cada aluno, construindo habilidades acadêmicas do básico ao avançado. Instrutores experientes apoiam o crescimento de cada estudante.",
      featuresLabel: "Características",
      imgAlt: "Sessão de tutoria individual em sala de aula",
      features: [
        "Aulas personalizadas adaptadas ao nível de compreensão de cada aluno",
        "Suporte passo a passo das habilidades básicas à aplicação avançada",
        "Preparação para provas e exames de admissão disponível",
      ],
    },
    compareTitle: "Comparando Abordagens de Aprendizado",
    compareBefore: "Autodidata",
    compareAfter: "Acecore Schools",
    ged: {
      title: "Equivalência do Ensino Médio",
      desc: "Oferecemos aulas preparatórias para o exame de equivalência do ensino médio para quem não concluiu o ensino médio. Apoiamos você na obtenção dos conhecimentos e qualificações necessários.",
      supportLabel: "Conteúdo de Suporte",
      supports: [
        "Preparação por disciplina (português, matemática, inglês, ciências sociais, ciências)",
        "Planos de estudo personalizados baseados no nível acadêmico individual",
        "Simulados e exercícios com provas anteriores para preparação prática",
      ],
    },
    ctaHeading: "Consultas e Matrículas",
    ctaBody:
      "Para detalhes dos cursos e inscrição, use o formulário de contato ou LINE. Também pode perguntar mesmo sem saber qual curso escolher.",
    ctaForm: "Formulário de Contato",
    ctaLine: "Contato via LINE",
    pricing: {
      title: "Faixas de mensalidade",
      body: "Para conferir o custo antes da inscrição, publicamos faixas de mensalidade, matrícula e materiais. Os valores são estimativas com impostos incluídos e variam por série, frequência, materiais e conteúdo.",
      ctaHeading: "Fale conosco sobre os custos detalhados.",
      ctaBody:
        "Entendemos série, objetivo e frequência possível para organizar um plano de estudos e uma faixa de custo realista.",
      ctaPricing: "Ver guia de preços",
      ctaContact: "Fale conosco",
      items: [
        {
          icon: "log-in",
          label: "Matrícula",
          price: "¥11.000-¥22.000",
          note: "Somente no início. Pode variar conforme série e curso.",
        },
        {
          icon: "calendar-days",
          label: "Mensalidade",
          price: "¥8.000-¥33.000",
          note: "Varia conforme frequência, duração das aulas e conteúdo de orientação individual.",
        },
        {
          icon: "book-open",
          label: "Materiais e gestão",
          price: "cerca de ¥5.000-¥30.000",
          note: "Materiais, peças de robótica, PC ou licenças podem gerar custos reais adicionais conforme o conteúdo.",
        },
      ],
    },
    learningSteps: [
      {
        title: "Encontre Seu Interesse",
        description:
          "Através de tutoria e experiências com robôs, ajudamos a encontrar o ponto de entrada de cada aluno para o aprendizado.",
        icon: "sparkles",
        accent: "amber",
      },
      {
        title: "Aprenda Fazendo",
        description:
          "Conecte experiência e compreensão através de trabalho prático com robôs, Minecraft e exercícios de programação.",
        icon: "bot",
        accent: "brand",
      },
      {
        title: "Conecte à Prática",
        description:
          "Eleve o aprendizado à resolução de problemas reais através de desenvolvimento web e utilização de ferramentas.",
        icon: "code-xml",
        accent: "emerald",
      },
      {
        title: "Torne Sustentável",
        description:
          "Crie um caminho de continuidade adequado a cada aluno, incluindo exames, certificações e uso cotidiano de TI.",
        icon: "flag",
        accent: "slate",
      },
    ],
    compareBeforeItems: [
      "Não sabe por onde começar",
      "Ninguém para consultar quando travado",
      "Difícil manter a motivação",
      "Não consegue ver a conexão com a prática",
    ],
    compareAfterItems: [
      "Sugestões personalizadas de ponto de entrada",
      "Pergunte aos instrutores a qualquer momento",
      "Continuidade natural através de experiência prática",
      "Diretamente conectado a exames, certificações e trabalho real",
    ],
  },
  fr: {
    robotProgramming: {
      progImgAlt: "Image d'apprentissage de la programmation",
      title: "Robotique / Programmation",
      desc: "Nous proposons des cours de pointe en programmation de robots. Les élèves peuvent apprendre les fondamentaux de la programmation en utilisant de vrais robots.",
      imgAlt: "Élève engagé dans l'apprentissage de la programmation",
      courses: [
        {
          title: "Cours de Robotique",
          description:
            "Apprenez le plaisir de créer et les mécanismes de base à travers l'assemblage pratique de robots en utilisant des kits comme la série Tamiya.",
        },
        {
          title: "Cours de Programmation de Robots",
          description:
            "Apprenez à contrôler des robots avec la programmation. Développez la pensée logique à travers le contrôle de capteurs et moteurs.",
        },
        {
          title: "Cours de Programmation Minecraft",
          description:
            "Apprenez les bases de la programmation dans le monde de Minecraft. Développez la pensée logique par l'apprentissage ludique.",
        },
      ],
    },
    practicalProgramming: {
      contentsLabel: "Contenus du Cours",
      title: "Programmation Pratique",
      desc: "Nous proposons un programme pour apprendre les compétences de programmation utilisées dans les environnements professionnels réels. Acquérez des compétences pratiques pour agir immédiatement.",
      contentLabel: "Ce que Vous Apprendrez",
      contents: [
        "Développement web frontend avec HTML / CSS / JavaScript",
        "Développement backend avec Python / Node.js",
        "Conception de bases de données, développement d'API et utilisation du cloud",
        "Git et flux de développement en équipe",
      ],
    },
    pcSmartphone: {
      levelsLabel: "Niveaux Pris en Charge",
      title: "PC / Smartphone",
      desc: "Apprenez les compétences informatiques et smartphone nécessaires dans la vie quotidienne et professionnelle. Nous proposons des cours pour tous les niveaux, des débutants aux avancés.",
      levelLabel: "Niveaux Supportés",
      imgAlt: "Élève apprenant sur ordinateur",
      levels: [
        "Utilisation basique de PC et smartphone (débutants bienvenus)",
        "Logiciels bureautiques : Word / Excel / PowerPoint",
        "Configuration et utilisation d'e-mail, réseaux sociaux et réunions en ligne",
        "Mesures de sécurité et résolution de problèmes",
      ],
    },
    title: "Acecore Schools",
    description:
      "Acecore Schools est une école d'informatique proposant une large variété de programmes éducatifs incluant le tutorat, la programmation de robots, la programmation pratique, les cours PC/smartphone et la préparation à l'équivalence du baccalauréat.",
    heroTitle: "Acecore Schools",
    heroSubtitle: "Enseignement personnalisé pour des compétences solides",
    heroImgAlt: "Scène d'apprentissage en classe",
    learningFlowEyebrow: "Learning Flow",
    learningFlowTitle:
      "Découvrez le parcours d'apprentissage d'Acecore Schools",
    learningFlowDesc:
      "De l'intérêt initial à la pratique et la continuité — présenté comme un parcours d'apprentissage unique.",
    intro:
      "Nous offrons un enseignement personnalisé adapté aux objectifs et au rythme de chaque élève, des enfants aux adultes. Vous pouvez aussi voir notre positionnement dans l'aperçu des services.",
    juku: {
      title: "Tutorat",
      desc: "Notre programme de tutorat offre un enseignement personnalisé adapté à chaque élève, construisant les compétences académiques du niveau de base au niveau avancé. Des instructeurs expérimentés soutiennent la croissance de chaque étudiant.",
      featuresLabel: "Caractéristiques",
      imgAlt: "Session de tutorat individuel en classe",
      features: [
        "Cours personnalisés adaptés au niveau de compréhension de chaque élève",
        "Soutien étape par étape des compétences de base à l'application avancée",
        "Préparation aux examens et examens d'entrée disponible",
      ],
    },
    compareTitle: "Comparer les Approches d'Apprentissage",
    compareBefore: "Autodidacte",
    compareAfter: "Acecore Schools",
    ged: {
      title: "Équivalence du Baccalauréat",
      desc: "Nous proposons des cours préparatoires à l'examen d'équivalence du baccalauréat pour ceux qui n'ont pas terminé le lycée. Nous vous soutenons dans l'obtention des connaissances et qualifications nécessaires.",
      supportLabel: "Contenu de Support",
      supports: [
        "Préparation par matière (français, mathématiques, anglais, sciences sociales, sciences)",
        "Plans d'études personnalisés basés sur le niveau académique individuel",
        "Examens blancs et exercices avec des épreuves précédentes pour une préparation pratique",
      ],
    },
    ctaHeading: "Consultations et Inscriptions",
    ctaBody:
      "Pour les détails des cours et l’inscription, utilisez le formulaire de contact ou LINE. Vous pouvez demander même si vous ne savez pas quel cours choisir.",
    ctaForm: "Formulaire de Contact",
    ctaLine: "Contact via LINE",
    pricing: {
      title: "Repères de frais de cours",
      body: "Pour estimer le coût avant l'inscription, nous indiquons les repères de mensualité, frais d'inscription et supports. Les montants sont des estimations TTC et varient selon le niveau, la fréquence, les supports et le contenu.",
      ctaHeading: "Contactez-nous pour un coût détaillé.",
      ctaBody:
        "Nous clarifions le niveau, l'objectif et la fréquence possible, puis proposons un plan d'apprentissage réaliste avec son coût.",
      ctaPricing: "Voir le guide tarifaire",
      ctaContact: "Nous contacter",
      items: [
        {
          icon: "log-in",
          label: "Frais d'inscription",
          price: "11 000-22 000 ¥",
          note: "Une seule fois au démarrage. Peut varier selon le niveau et le cours.",
        },
        {
          icon: "calendar-days",
          label: "Mensualité",
          price: "8 000-33 000 ¥",
          note: "Varie selon la fréquence, la durée des cours et le niveau d'accompagnement individuel.",
        },
        {
          icon: "book-open",
          label: "Supports et gestion",
          price: "environ 5 000-30 000 ¥",
          note: "Les supports, pièces de robotique, PC ou licences peuvent entraîner des frais réels selon le contenu.",
        },
      ],
    },
    learningSteps: [
      {
        title: "Trouvez votre Intérêt",
        description:
          "À travers le tutorat et les expériences avec les robots, nous aidons à trouver le point d'entrée de chaque élève dans l'apprentissage.",
        icon: "sparkles",
        accent: "amber",
      },
      {
        title: "Apprenez en Faisant",
        description:
          "Connectez expérience et compréhension à travers le travail pratique avec des robots, Minecraft et des exercices de programmation.",
        icon: "bot",
        accent: "brand",
      },
      {
        title: "Reliez à la Pratique",
        description:
          "Élevez l'apprentissage à la résolution de problèmes réels à travers le développement web et l'utilisation d'outils.",
        icon: "code-xml",
        accent: "emerald",
      },
      {
        title: "Rendez Durable",
        description:
          "Créez un chemin de continuité adapté à chaque élève, incluant examens, certifications et utilisation quotidienne de l'informatique.",
        icon: "flag",
        accent: "slate",
      },
    ],
    compareBeforeItems: [
      "Ne sait pas par où commencer",
      "Personne à consulter en cas de blocage",
      "Difficile de maintenir la motivation",
      "Ne voit pas le lien avec la pratique",
    ],
    compareAfterItems: [
      "Suggestions personnalisées de point d'entrée",
      "Demandez aux instructeurs à tout moment",
      "Continuité naturelle à travers l'expérience pratique",
      "Directement connecté aux examens, certifications et travail réel",
    ],
  },
  ko: {
    robotProgramming: {
      progImgAlt: "프로그래밍 학습 이미지",
      title: "로봇 / 프로그래밍",
      desc: "최첨단 기술을 도입한 로봇 프로그래밍 수업을 제공합니다. 실제 로봇을 사용하여 프로그래밍의 기초를 배울 수 있습니다.",
      imgAlt: "프로그래밍 학습에 몰두하는 학생",
      courses: [
        {
          title: "로봇 코스",
          description:
            "타미야 공작 시리즈 등을 사용한 실제 로봇 공작을 통해 만들기의 즐거움과 기본 원리를 배웁니다.",
        },
        {
          title: "로봇 프로그래밍 코스",
          description:
            "프로그래밍으로 로봇을 제어하는 기술을 배웁니다. 센서와 모터 제어를 통해 논리적 사고력을 기릅니다.",
        },
        {
          title: "마인크래프트 프로그래밍 과정",
          description:
            "마인크래프트 세계에서 프로그래밍 기초를 즐겁게 배웁니다. 게임을 통해 논리적 사고력을 기릅니다.",
        },
      ],
    },
    practicalProgramming: {
      contentsLabel: "학습 내용",
      title: "실습 프로그래밍",
      desc: "실제 업무에서 사용되는 프로그래밍 기술을 배울 수 있는 커리큘럼을 제공합니다. 실전 기술을 익혀 즉시 활약할 수 있습니다.",
      contentLabel: "배울 수 있는 내용",
      contents: [
        "HTML / CSS / JavaScript를 사용한 웹 프론트엔드 개발",
        "Python / Node.js 등을 사용한 백엔드 개발",
        "데이터베이스 설계, API 구축, 클라우드 활용",
        "Git 및 팀 개발 워크플로",
      ],
    },
    pcSmartphone: {
      levelsLabel: "지원 레벨",
      title: "PC / 스마트폰",
      desc: "일상생활과 비즈니스에서 필요한 PC와 스마트폰 조작 기술을 배울 수 있습니다. 초심자부터 상급자까지 폭넓은 수업을 제공합니다.",
      levelLabel: "대응 레벨",
      imgAlt: "PC로 학습하는 수강생",
      levels: [
        "PC・스마트폰 기본 조작 (초심자 환영)",
        "오피스 소프트웨어: Word / Excel / PowerPoint 활용",
        "이메일, SNS, 온라인 회의 설정 및 사용법",
        "보안 대책 및 문제 해결",
      ],
    },
    title: "Acecore Schools",
    description:
      "Acecore Schools는 학습 지도, 로봇 프로그래밍, 실습 프로그래밍, PC/스마트폰 강좌, 고졸 인정 시험 대비 등 폭넓은 교육 프로그램을 제공하는 IT 스쿨입니다.",
    heroTitle: "Acecore Schools",
    heroSubtitle: "개인 맞춤 지도로 확실한 실력을",
    heroImgAlt: "교실 학습 풍경",
    learningFlowEyebrow: "Learning Flow",
    learningFlowTitle: "Acecore Schools의 학습 과정 알아보기",
    learningFlowDesc:
      "흥미 발견부터 실습, 지속까지를 하나의 학습 경로로 보여줍니다.",
    intro:
      "어린이부터 성인까지 각자의 목표와 속도에 맞춘 개별 지도를 하고 있습니다. 서비스 일람에서 위치도 확인하실 수 있습니다.",
    juku: {
      title: "학습 지도",
      desc: "학생 한 명 한 명에 맞춘 지도로 기초부터 응용까지의 학력을 키웁니다. 경험 풍부한 강사진이 학생의 성장을 지원합니다.",
      featuresLabel: "특징",
      imgAlt: "교실 개별 지도 풍경",
      features: [
        "학생의 이해도에 맞춘 개별 수업",
        "기초 정착부터 응용력 양성까지 단계적 지원",
        "정기 시험 및 입시 대비 지원",
      ],
    },
    compareTitle: "학습 방식 비교",
    compareBefore: "독학",
    compareAfter: "Acecore Schools",
    ged: {
      title: "고졸 인정",
      desc: "고등학교를 졸업하지 않은 분을 대상으로 고졸 인정 시험 대비 수업을 제공합니다. 필요한 지식과 자격 취득을 지원합니다.",
      supportLabel: "지원 내용",
      supports: [
        "과목별 시험 대비 (국어, 수학, 영어, 사회, 과학)",
        "개인 학력에 맞춘 학습 계획 수립",
        "모의시험 및 기출문제 연습",
      ],
    },
    ctaHeading: "문의 및 신청",
    ctaBody:
      "각 코스의 상세 내용과 신청은 문의 폼 또는 LINE으로 상담해 주세요. 어떤 코스가 맞는지 모르더라도 괜찮습니다.",
    ctaForm: "문의 양식",
    ctaLine: "LINE으로 문의하기",
    pricing: {
      title: "수업료 기준",
      body: "수강 전에 비용감을 확인할 수 있도록 월 수업료, 입회금, 교재비 기준을 공개합니다. 금액은 세금 포함 예상가이며 학년, 횟수, 교재, 수강 내용에 따라 달라집니다.",
      ctaHeading: "자세한 비용은 편하게 문의해 주세요.",
      ctaBody:
        "학년, 목표, 가능한 횟수를 확인해 무리 없는 학습 플랜과 비용감을 정리합니다.",
      ctaPricing: "요금표 보기",
      ctaContact: "문의하기",
      items: [
        {
          icon: "log-in",
          label: "입회금",
          price: "1.1만〜2.2만 엔",
          note: "처음 한 번만 발생합니다. 학년과 코스에 따라 달라질 수 있습니다.",
        },
        {
          icon: "calendar-days",
          label: "월 수업료",
          price: "8천〜3.3만 엔",
          note: "주당 횟수, 수업 시간, 개별 지도 내용에 따라 달라집니다.",
        },
        {
          icon: "book-open",
          label: "교재 및 관리비",
          price: "약 5천〜3만 엔",
          note: "교재, 로봇 부품, PC/라이선스 비용 등은 내용에 따라 실비가 발생할 수 있습니다.",
        },
      ],
    },
    learningSteps: [
      {
        title: "흥미 찾기",
        description:
          "학습 지도와 로봇 체험을 통해 각 학생의 학습 입구를 찾습니다.",
        icon: "sparkles",
        accent: "amber",
      },
      {
        title: "직접 해보며 이해하기",
        description:
          "로봇 실습, 마인크래프트, 코딩 연습으로 경험과 이해를 연결합니다.",
        icon: "bot",
        accent: "brand",
      },
      {
        title: "실전에 연결하기",
        description:
          "웹 개발과 도구 활용으로 실제 문제 해결 역량으로 끌어올립니다.",
        icon: "code-xml",
        accent: "emerald",
      },
      {
        title: "지속 가능하게 만들기",
        description:
          "시험, 자격증, 일상 IT 활용까지 포함하여 각자에게 맞는 지속 경로를 만듭니다.",
        icon: "flag",
        accent: "slate",
      },
    ],
    compareBeforeItems: [
      "무엇부터 시작해야 할지 모르겠다",
      "막혀도 상담할 사람이 없다",
      "동기 부여를 유지하기 어렵다",
      "실전과의 연결이 보이지 않는다",
    ],
    compareAfterItems: [
      "개인에 맞는 입문 방법 제안",
      "언제든 강사에게 질문 가능",
      "체험을 통해 자연스럽게 지속",
      "시험, 자격증, 실무에 직결",
    ],
  },
  de: {
    title: "Acecore Schools",
    description:
      "Acecore Schools ist eine IT-Schule, die eine breite Palette von Bildungsprogrammen anbietet, darunter Nachhilfe, Roboter-Programmierung, praktische Programmierung, PC/Smartphone-Kurse und Schulabschluss-Vorbereitung.",
    heroTitle: "Acecore Schools",
    heroSubtitle: "Individueller Unterricht für solide Fähigkeiten",
    heroImgAlt: "Lernszene im Klassenzimmer",
    learningFlowEyebrow: "Learning Flow",
    learningFlowTitle: "Entdecken Sie den Lernweg bei Acecore Schools",
    learningFlowDesc:
      "Vom ersten Interesse über die Praxis bis zur Kontinuität — dargestellt als ein einzigartiger Lernweg.",
    intro:
      "Wir bieten individuellen Unterricht, angepasst an die Ziele und das Tempo jedes Schülers, von Kindern bis zu Erwachsenen. Unsere Positionierung können Sie auch in der Dienstleistungsübersicht sehen.",
    juku: {
      title: "Nachhilfe",
      desc: "Unser Nachhilfeprogramm bietet individuellen Unterricht, angepasst an jeden Schüler, und baut akademische Fähigkeiten vom Grundniveau bis zum Fortgeschrittenen auf. Erfahrene Lehrkräfte unterstützen das Wachstum jedes Schülers.",
      featuresLabel: "Merkmale",
      imgAlt: "Einzelnachhilfestunde im Klassenzimmer",
      features: [
        "Personalisierte Stunden, angepasst an das Verständnisniveau jedes Schülers",
        "Schritt-für-Schritt-Unterstützung von Grundkenntnissen bis zur fortgeschrittenen Anwendung",
        "Vorbereitung auf Tests und Aufnahmeprüfungen verfügbar",
      ],
    },
    robotProgramming: {
      title: "Robotik / Programmierung",
      desc: "Wir bieten fortschrittliche Kurse in Roboter-Programmierung an. Die Schüler können Programmiergrundlagen mit echten Robotern erlernen.",
      imgAlt: "Schüler beim Programmieren lernen",
      progImgAlt: "Schüler beim Programmieren lernen",
      courses: [
        {
          title: "Robotik-Kurs",
          description:
            "Lernen Sie die Freude am Bauen und grundlegende Mechanismen durch praktischen Roboter-Zusammenbau mit Bausätzen wie der Tamiya-Serie.",
        },
        {
          title: "Roboter-Programmierung-Kurs",
          description:
            "Lernen Sie, Roboter mit Programmierung zu steuern. Entwickeln Sie logisches Denken durch die Steuerung von Sensoren und Motoren.",
        },
        {
          title: "Minecraft-Programmierung-Kurs",
          description:
            "Lernen Sie Programmiergrundlagen mit dem beliebten Spiel Minecraft. Entwickeln Sie auf natürliche Weise informatisches Denken beim Spielen.",
        },
      ],
    },
    compareTitle: "Lernansätze Vergleichen",
    compareBefore: "Autodidakt",
    compareAfter: "Acecore Schools",
    practicalProgramming: {
      title: "Praktische Programmierung",
      desc: "Wir bieten ein Curriculum zum Erlernen von Programmierkenntnissen, die in realen Geschäftsumgebungen verwendet werden. Erwerben Sie praktische Fähigkeiten für den sofortigen Einsatz.",
      contentLabel: "Was Sie lernen werden",
      contentsLabel: "Kursinhalte",
      contents: [
        "Frontend-Webentwicklung mit HTML / CSS / JavaScript",
        "Backend-Entwicklung mit Python / Node.js",
        "Datenbank-Design, API-Entwicklung und Cloud-Nutzung",
        "Git und Team-Entwicklungs-Workflows",
      ],
    },
    pcSmartphone: {
      title: "PC / Smartphone",
      desc: "Lernen Sie Computer- und Smartphone-Fähigkeiten, die im Alltag und Beruf benötigt werden. Wir bieten Kurse für alle Niveaus, von Anfängern bis Fortgeschrittenen.",
      levelLabel: "Unterstützte Niveaus",
      imgAlt: "Schüler lernt am Computer",
      levelsLabel: "Unterstützte Niveaus",
      levels: [
        "Grundlegende PC- und Smartphone-Bedienung (Anfänger willkommen)",
        "Büroanwendungen: Word / Excel / PowerPoint",
        "E-Mail-, Social-Media- und Online-Meeting-Einrichtung und -Nutzung",
        "Sicherheitsmaßnahmen und Problemlösung",
      ],
    },
    ged: {
      title: "Schulabschluss-Vorbereitung",
      desc: "Wir bieten Vorbereitungskurse für die Schulabschlussprüfung für diejenigen, die die Oberschule nicht abgeschlossen haben. Wir unterstützen Sie beim Erwerb der notwendigen Kenntnisse und Qualifikationen.",
      supportLabel: "Unterstützungsinhalte",
      supports: [
        "Vorbereitung nach Fachgebiet (Deutsch, Mathematik, Englisch, Sozialwissenschaften, Naturwissenschaften)",
        "Individuelle Lernpläne basierend auf dem jeweiligen akademischen Niveau",
        "Probeprüfungen und Übungen mit früheren Prüfungen zur praktischen Vorbereitung",
      ],
    },
    ctaHeading: "Beratung und Anmeldung",
    ctaBody:
      "Für Kursdetails und Anmeldung nutzen Sie bitte das Kontaktformular oder LINE. Sie können auch fragen, wenn Sie nicht wissen, welcher Kurs passt.",
    ctaForm: "Kontaktformular",
    ctaLine: "Kontakt über LINE",
    contentsLabel: "Inhalte",
    levelsLabel: "Stufen",
    pricing: {
      title: "Richtwerte für Unterrichtsgebühren",
      body: "Damit Sie die Kosten vorab einschätzen können, zeigen wir Richtwerte für Monatsgebühr, Aufnahmegebühr und Materialien. Alle Beträge sind Richtwerte inklusive Steuern und variieren nach Klassenstufe, Häufigkeit, Materialien und Unterrichtsinhalt.",
      ctaHeading: "Fragen Sie uns gern nach den genauen Kosten.",
      ctaBody:
        "Wir klären Klassenstufe, Ziel und mögliche Häufigkeit und schlagen einen realistischen Lernplan mit Kostenrahmen vor.",
      ctaPricing: "Preisübersicht ansehen",
      ctaContact: "Anfragen",
      items: [
        {
          icon: "log-in",
          label: "Aufnahmegebühr",
          price: "11.000-22.000 ¥",
          note: "Nur beim Start. Je nach Klassenstufe und Kurs kann der Betrag variieren.",
        },
        {
          icon: "calendar-days",
          label: "Monatsgebühr",
          price: "8.000-33.000 ¥",
          note: "Abhängig von Häufigkeit, Unterrichtsdauer und Anteil individueller Betreuung.",
        },
        {
          icon: "book-open",
          label: "Material- und Verwaltungskosten",
          price: "etwa 5.000-30.000 ¥",
          note: "Für Materialien, Robotik-Teile, PC- oder Lizenzkosten können je nach Inhalt zusätzliche tatsächliche Kosten anfallen.",
        },
      ],
    },
    learningSteps: [
      {
        title: "Finden Sie Ihr Interesse",
        description:
          "Durch Nachhilfe und Roboter-Erfahrungen helfen wir, den Einstiegspunkt jedes Schülers zum Lernen zu finden.",
        icon: "sparkles",
        accent: "amber",
      },
      {
        title: "Lernen durch Handeln",
        description:
          "Verbinden Sie Erfahrung und Verständnis durch praktische Arbeit mit Robotern, Minecraft und Programmierübungen.",
        icon: "bot",
        accent: "brand",
      },
      {
        title: "Mit der Praxis Verbinden",
        description:
          "Heben Sie das Lernen auf die Ebene realer Problemlösung durch Webentwicklung und Tool-Nutzung.",
        icon: "code-xml",
        accent: "emerald",
      },
      {
        title: "Nachhaltig Gestalten",
        description:
          "Schaffen Sie einen Weg der Kontinuität, der zu jedem Schüler passt, einschließlich Prüfungen, Zertifizierungen und alltäglicher IT-Nutzung.",
        icon: "flag",
        accent: "slate",
      },
    ],
    compareBeforeItems: [
      "Weiß nicht, wo man anfangen soll",
      "Niemand, den man bei Problemen fragen kann",
      "Schwierig, die Motivation aufrechtzuerhalten",
      "Keinen Zusammenhang zur Praxis erkennbar",
    ],
    compareAfterItems: [
      "Personalisierte Einstiegsvorschläge",
      "Fragen Sie die Lehrkräfte jederzeit",
      "Natürliche Kontinuität durch praktische Erfahrung",
      "Direkt verbunden mit Prüfungen, Zertifizierungen und echter Arbeit",
    ],
  },
  ru: {
    robotProgramming: {
      progImgAlt: "Изображение обучения программированию",
      title: "Робототехника / Программирование",
      desc: "Мы предлагаем передовые курсы по программированию роботов. Ученики могут изучать основы программирования с использованием настоящих роботов.",
      imgAlt: "Ученик, увлечённый изучением программирования",
      courses: [
        {
          title: "Курс Робототехники",
          description:
            "Познайте радость создания и базовые механизмы через практическую сборку роботов с использованием наборов, таких как серия Tamiya.",
        },
        {
          title: "Курс Программирования Роботов",
          description:
            "Научитесь управлять роботами с помощью программирования. Развивайте логическое мышление через управление сенсорами и моторами.",
        },
        {
          title: "Курс программирования с Minecraft",
          description:
            "Изучайте основы программирования в мире Minecraft. Развивайте логическое мышление через игровое обучение.",
        },
      ],
    },
    practicalProgramming: {
      contentsLabel: "Содержание Курса",
      title: "Практическое Программирование",
      desc: "Мы предлагаем учебную программу для освоения навыков программирования, используемых в реальных бизнес-средах. Приобретите практические навыки для немедленного применения.",
      contentLabel: "Чему Вы Научитесь",
      contents: [
        "Фронтенд-разработка с HTML / CSS / JavaScript",
        "Бэкенд-разработка с Python / Node.js",
        "Проектирование баз данных, разработка API и использование облачных технологий",
        "Git и процессы командной разработки",
      ],
    },
    pcSmartphone: {
      levelsLabel: "Поддерживаемые Уровни",
      title: "ПК / Смартфон",
      desc: "Освойте навыки работы с компьютером и смартфоном, необходимые в повседневной жизни и бизнесе. Мы предлагаем занятия для всех уровней — от начинающих до продвинутых.",
      levelLabel: "Поддерживаемые уровни",
      imgAlt: "Ученик, обучающийся на компьютере",
      levels: [
        "Базовая работа с ПК и смартфоном (начинающие приветствуются)",
        "Офисные приложения: Word / Excel / PowerPoint",
        "Настройка и использование электронной почты, соцсетей и онлайн-встреч",
        "Меры безопасности и устранение неполадок",
      ],
    },
    title: "Acecore Schools",
    description:
      "Acecore Schools — IT-школа, предлагающая широкий спектр образовательных программ, включая репетиторство, робототехнику, практическое программирование, курсы ПК/смартфонов и подготовку к аттестату.",
    heroTitle: "Acecore Schools",
    heroSubtitle: "Индивидуальное обучение для надёжных навыков",
    heroImgAlt: "Сцена обучения в классе",
    learningFlowEyebrow: "Learning Flow",
    learningFlowTitle: "Познакомьтесь с учебным путём Acecore Schools",
    learningFlowDesc:
      "От первого интереса к практике и устойчивости — представлено как единый учебный путь.",
    intro:
      "Мы предлагаем индивидуальное обучение, адаптированное к целям и темпу каждого ученика — от детей до взрослых. Наше позиционирование вы также можете увидеть в обзоре услуг.",
    juku: {
      title: "Репетиторство",
      desc: "Наша программа репетиторства предлагает индивидуальное обучение, адаптированное под каждого ученика, развивая учебные навыки от базового до продвинутого уровня. Опытные преподаватели поддерживают рост каждого учащегося.",
      featuresLabel: "Особенности",
      imgAlt: "Индивидуальное репетиторство в классе",
      features: [
        "Персонализированные занятия, адаптированные к уровню понимания каждого ученика",
        "Пошаговая поддержка от базовых навыков до продвинутого применения",
        "Доступна подготовка к тестам и вступительным экзаменам",
      ],
    },
    compareTitle: "Сравнение Подходов к Обучению",
    compareBefore: "Самообразование",
    compareAfter: "Acecore Schools",
    ged: {
      title: "Подготовка к Аттестату",
      desc: "Мы предлагаем подготовительные курсы к экзамену на аттестат для тех, кто не окончил среднюю школу. Мы поддержим вас в получении необходимых знаний и квалификаций.",
      supportLabel: "Содержание Поддержки",
      supports: [
        "Подготовка по предметам (русский, математика, английский, обществознание, естественные науки)",
        "Индивидуальные учебные планы на основе академического уровня ученика",
        "Пробные экзамены и упражнения с прошлыми заданиями для практической подготовки",
      ],
    },
    ctaHeading: "Консультации и Запись",
    ctaBody:
      "Для деталей курсов и записи используйте форму контакта или LINE. Можно спрашивать, даже если вы не уверены, какой курс выбрать.",
    ctaForm: "Форма Обратной Связи",
    ctaLine: "Связь через LINE",
    pricing: {
      title: "Ориентиры по оплате занятий",
      body: "Чтобы оценить расходы до записи, мы публикуем ориентиры по ежемесячной оплате, вступительному взносу и материалам. Суммы указаны с учетом налога и зависят от класса, частоты, материалов и содержания обучения.",
      ctaHeading: "Свяжитесь с нами для уточнения стоимости.",
      ctaBody:
        "Мы уточним класс, цель и возможную частоту занятий, затем предложим реалистичный учебный план и бюджет.",
      ctaPricing: "Смотреть ориентиры по стоимости",
      ctaContact: "Связаться",
      items: [
        {
          icon: "log-in",
          label: "Вступительный взнос",
          price: "11 000-22 000 ¥",
          note: "Оплачивается только при начале обучения. Может отличаться по классу и курсу.",
        },
        {
          icon: "calendar-days",
          label: "Ежемесячная оплата",
          price: "8 000-33 000 ¥",
          note: "Зависит от частоты, длительности занятий и объема индивидуальной поддержки.",
        },
        {
          icon: "book-open",
          label: "Материалы и администрирование",
          price: "примерно 5 000-30 000 ¥",
          note: "Материалы, детали для робототехники, ПК или лицензии могут потребовать фактических дополнительных расходов.",
        },
      ],
    },
    learningSteps: [
      {
        title: "Найдите Свой Интерес",
        description:
          "Через репетиторство и опыт с роботами мы помогаем найти точку входа каждого ученика в обучение.",
        icon: "sparkles",
        accent: "amber",
      },
      {
        title: "Учитесь на Практике",
        description:
          "Соединяйте опыт и понимание через практическую работу с роботами, Minecraft и упражнения по программированию.",
        icon: "bot",
        accent: "brand",
      },
      {
        title: "Связь с Практикой",
        description:
          "Переведите обучение на уровень решения реальных задач через веб-разработку и использование инструментов.",
        icon: "code-xml",
        accent: "emerald",
      },
      {
        title: "Сделайте Устойчивым",
        description:
          "Создайте путь продолжения, подходящий каждому ученику, включая экзамены, сертификаты и повседневное использование ИТ.",
        icon: "flag",
        accent: "slate",
      },
    ],
    compareBeforeItems: [
      "Не знаю, с чего начать",
      "Не к кому обратиться, когда застрял",
      "Трудно поддерживать мотивацию",
      "Не видно связи с практикой",
    ],
    compareAfterItems: [
      "Персонализированные предложения точки входа",
      "Спрашивайте преподавателей в любое время",
      "Естественная преемственность через практический опыт",
      "Напрямую связано с экзаменами, сертификатами и реальной работой",
    ],
  },
} as const;

export const schoolsOrigin = "https://schools.acecore.net";
export const acecoreOrigin = "https://acecore.net";
export const lineUrl = "https://lin.ee/DjIrdqj";

export function getLocalePath(locale: Locale) {
  return locale === defaultLocale ? "/" : "/" + locale + "/";
}

export function getLocalizedAcecoreUrl(locale: Locale, path: string) {
  const normalized = path.startsWith("/") ? path : "/" + path;
  return locale === defaultLocale
    ? acecoreOrigin + normalized
    : acecoreOrigin + "/" + locale + normalized;
}
