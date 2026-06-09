import type { Locale } from "./schools";

export interface SchoolsDetailContent {
  trial: {
    eyebrow: string;
    title: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
    note: string;
    points: string[];
  };
  courses: {
    eyebrow: string;
    title: string;
    body: string;
    audienceLabel: string;
    frequencyLabel: string;
    items: {
      icon: string;
      title: string;
      audience: string;
      frequency: string;
      body: string;
    }[];
  };
  schedule: {
    eyebrow: string;
    title: string;
    body: string;
    dayLabel: string;
    timeLabel: string;
    noteLabel: string;
    note: string;
    items: {
      day: string;
      time: string;
      note: string;
    }[];
  };
  faqEyebrow: string;
  faqTitle: string;
  faqs: {
    question: string;
    answer: string;
  }[];
  finalCta: {
    title: string;
    body: string;
    primary: string;
    secondary: string;
  };
}

export const schoolsDetailContent = {
  ja: {
    trial: {
      eyebrow: "Free Trial",
      title: "まずは無料体験で、学び方と相性を確認できます",
      body: "初回は学習状況、目標、得意不得意を確認し、どのコース・頻度が合うかを一緒に整理します。予約機能の実装までは、お問い合わせフォームまたはLINEで日程を調整します。",
      primaryCta: "無料体験を予約する",
      secondaryCta: "料金の目安を見る",
      note: "予約機能、変更、キャンセルは今後Schools app側で扱います。現時点ではお問い合わせフォームまたはLINEからご相談ください。",
      points: [
        "学習目的と現在地を確認して、無理のない初回プランを提案します。",
        "保護者同席での相談や、学校・家庭学習との両立相談にも対応します。",
        "日程確定後、当日の持ち物・接続案内をお送りします。",
      ],
    },
    courses: {
      eyebrow: "Courses",
      title: "対象者と授業頻度が分かるコース一覧",
      body: "個別指導を基本に、学校の学習支援から実践的なプログラミングまで幅広く対応します。頻度は目標や生活リズムに合わせて調整できます。",
      audienceLabel: "対象者",
      frequencyLabel: "授業頻度",
      items: [
        {
          icon: "book-open",
          title: "学習塾・個別指導",
          audience: "小学生・中学生・高校生",
          frequency: "週1回から。定期テスト前は追加相談可。",
          body: "学校内容の復習、定期テスト対策、受験に向けた基礎固めを一人ひとりの理解度に合わせて進めます。",
        },
        {
          icon: "bot",
          title: "ロボット / プログラミング",
          audience: "小学生・中学生、初めてプログラミングに触れる方",
          frequency: "月2回または週1回を目安に調整。",
          body: "ロボット工作、マイクラプログラミング、Scratchなどを使い、楽しみながら論理的に考える力を伸ばします。",
        },
        {
          icon: "code-xml",
          title: "実践プログラミング",
          audience: "中学生以上、社会人、制作物を作りたい方",
          frequency: "週1回から。短期集中は個別相談。",
          body: "Web開発、バックエンド、データベース、Gitなど、実際の制作に近い題材で手を動かしながら学びます。",
        },
        {
          icon: "monitor-smartphone",
          title: "パソコン / スマホ教室",
          audience: "学生、保護者、社会人、シニア",
          frequency: "単発相談または月2回から。",
          body: "基本操作、Office、セキュリティ、スマホ設定、日常で困るデジタル操作を実用ベースで支援します。",
        },
        {
          icon: "clipboard-check",
          title: "高卒認定対策",
          audience: "高卒認定試験を目指す方、学び直したい方",
          frequency: "週1回から。受験科目数に応じて調整。",
          body: "受験科目の整理、学習計画、基礎復習、過去問対策まで、無理なく継続できる計画を一緒に作ります。",
        },
      ],
    },
    schedule: {
      eyebrow: "Schedule",
      title: "通いやすい曜日・時間帯を相談できます",
      body: "下記は標準枠です。学校行事、部活動、仕事、家庭の予定に合わせて、無料体験時に個別調整します。",
      dayLabel: "曜日",
      timeLabel: "時間帯",
      noteLabel: "対象・使い方",
      note: "最新の空き枠はお問い合わせ時に確認できます。祝日、長期休み、イベント時は別枠を案内する場合があります。",
      items: [
        {
          day: "平日",
          time: "16:00-21:00",
          note: "学校帰りの小中高生、部活動後の学習、社会人の夜間学習に対応します。",
        },
        {
          day: "土曜日",
          time: "10:00-18:00",
          note: "ロボット、プログラミング、受験対策、まとまった制作時間に向いています。",
        },
        {
          day: "日曜日・祝日",
          time: "個別相談",
          note: "短期集中、イベント、試験前の追加枠など、必要に応じて相談できます。",
        },
      ],
    },
    faqEyebrow: "FAQ",
    faqTitle: "保護者向けFAQ",
    faqs: [
      {
        question: "無料体験では何をしますか？",
        answer:
          "学習状況、目標、困っていることを確認し、短い体験授業と今後の進め方の提案を行います。保護者の方も同席できます。",
      },
      {
        question: "パソコンを持っていなくても参加できますか？",
        answer:
          "内容によって貸出や代替方法を案内できます。必要な持ち物は予約後の確認メールでお知らせします。",
      },
      {
        question: "学校の勉強とプログラミングを両方相談できますか？",
        answer:
          "可能です。学習塾とITスクールを分けず、目標や時期に合わせて学習支援とプログラミングを組み合わせます。",
      },
      {
        question: "授業の変更やキャンセルはどこで行いますか？",
        answer:
          "予約、変更、キャンセルはSchools app側のポータルで扱う方針です。現在はお問い合わせフォームまたはLINEでご相談ください。",
      },
      {
        question: "外部カレンダーから予約を編集できますか？",
        answer:
          "安全性のため、Outlookなど外部カレンダーは表示専用にする方針です。変更やキャンセルは、実装後のポータルから行います。",
      },
    ],
    finalCta: {
      title: "無料体験から始めましょう",
      body: "まだコースが決まっていなくても大丈夫です。学びたいこと、困っていること、通える曜日をもとに初回の内容を整理します。",
      primary: "Schools appで予約する",
      secondary: "問い合わせで相談する",
    },
  },
  en: {
    trial: {
      eyebrow: "Free Trial",
      title: "Start with a free trial to check the learning style and fit",
      body: "In the first session, we review the learner's current situation, goals, strengths, and difficulties, then suggest a suitable course and frequency. Reservations and schedule coordination are handled in the Schools app.",
      primaryCta: "Book a free trial",
      secondaryCta: "View pricing guide",
      note: "Reservations, changes, and cancellations are handled in the Schools app. Acecore Schools provides guide information only.",
      points: [
        "We review goals and current level, then suggest a realistic first plan.",
        "Parents can join the consultation, including questions about balancing school and home study.",
        "After online booking, we send a confirmation email with preparation and access details.",
      ],
    },
    courses: {
      eyebrow: "Courses",
      title: "Courses with target learners and lesson frequency",
      body: "Based on one-on-one instruction, we support everything from school study to practical programming. Frequency can be adjusted to the learner's goals and routine.",
      audienceLabel: "Target learners",
      frequencyLabel: "Lesson frequency",
      items: [
        {
          icon: "book-open",
          title: "Tutoring and individual study support",
          audience: "Elementary, junior high, and high school students",
          frequency:
            "From once a week. Extra sessions can be discussed before exams.",
          body: "We support review, test preparation, and exam foundations according to each learner's understanding.",
        },
        {
          icon: "bot",
          title: "Robotics / Programming",
          audience:
            "Elementary and junior high students, plus first-time programmers",
          frequency: "Usually twice a month or once a week.",
          body: "Learners build logical thinking through robotics, Minecraft programming, Scratch, and hands-on projects.",
        },
        {
          icon: "code-xml",
          title: "Practical programming",
          audience:
            "Junior high students and older, adults, and people who want to build projects",
          frequency:
            "From once a week. Short intensive plans are available by consultation.",
          body: "We learn web development, backends, databases, Git, and production-style workflows through real exercises.",
        },
        {
          icon: "monitor-smartphone",
          title: "PC / Smartphone lessons",
          audience: "Students, parents, adults, and seniors",
          frequency: "Single consultation or from twice a month.",
          body: "We help with daily digital tasks such as basic operations, Office apps, security, and smartphone settings.",
        },
        {
          icon: "clipboard-check",
          title: "High school equivalency exam support",
          audience:
            "Learners preparing for the equivalency exam or returning to study",
          frequency: "From once a week, adjusted by subject count.",
          body: "We organize subjects, study plans, review basics, and practice past questions with a sustainable plan.",
        },
      ],
    },
    schedule: {
      eyebrow: "Schedule",
      title: "Consult about days and times that fit your routine",
      body: "These are standard time slots. We adjust during the free trial based on school events, clubs, work, and family schedules.",
      dayLabel: "Day",
      timeLabel: "Time",
      noteLabel: "Use case",
      note: "Check the Schools app for the latest availability. Holidays, long vacations, and events may use separate slots.",
      items: [
        {
          day: "Weekdays",
          time: "16:00-21:00",
          note: "After-school study, post-club study, and evening lessons for adults.",
        },
        {
          day: "Saturday",
          time: "10:00-18:00",
          note: "Robotics, programming, exam preparation, and longer project work.",
        },
        {
          day: "Sunday / holidays",
          time: "By consultation",
          note: "Short intensive sessions, events, or extra exam-period slots.",
        },
      ],
    },
    faqEyebrow: "FAQ",
    faqTitle: "FAQ for parents",
    faqs: [
      {
        question: "What happens during the free trial?",
        answer:
          "We review the learner's situation, goals, and concerns, provide a short trial lesson, and suggest how to proceed. Parents can attend.",
      },
      {
        question: "Can we join without owning a computer?",
        answer:
          "Depending on the lesson, we can suggest rental or alternative options. Required items are sent in the confirmation email.",
      },
      {
        question: "Can we discuss both school study and programming?",
        answer:
          "Yes. We combine study support and programming based on goals and timing instead of treating them as separate tracks.",
      },
      {
        question: "Where are lesson changes and cancellations handled?",
        answer:
          "Reservations, changes, and cancellations are planned to be handled in the Schools app portal. Acecore Schools does not provide editing features.",
      },
      {
        question: "Can external calendars edit reservations?",
        answer:
          "For safety, external calendars such as Outlook are planned to be read-only. Changes and cancellations are handled from the portal.",
      },
    ],
    finalCta: {
      title: "Start with a free trial",
      body: "You do not need to choose a course in advance. We will organize the first session based on what you want to learn, where you need help, and available days.",
      primary: "Book in the Schools app",
      secondary: "Ask through contact",
    },
  },
  "zh-cn": {
    trial: {
      eyebrow: "Free Trial",
      title: "先通过免费体验确认学习方式和相性",
      body: "第一次会确认当前学习情况、目标、擅长和不擅长的内容，并一起整理适合的课程和频率。预约和日程调整在 Schools app 中受理。",
      primaryCta: "预约免费体验",
      secondaryCta: "查看费用参考",
      note: "预约、变更和取消在 Schools app 中处理。Acecore Schools 只提供说明信息。",
      points: [
        "确认学习目标和当前位置，提出不过度勉强的初次计划。",
        "家长可一起参加，也可以咨询学校学习和家庭学习的平衡。",
        "在线预约后会发送确认邮件以及当天准备事项。",
      ],
    },
    courses: {
      eyebrow: "Courses",
      title: "可确认对象和授课频率的课程列表",
      body: "以个别指导为基础，从学校学习支持到实践编程都可对应。频率可根据目标和生活节奏调整。",
      audienceLabel: "对象",
      frequencyLabel: "授课频率",
      items: [
        {
          icon: "book-open",
          title: "学习塾・个别指导",
          audience: "小学生・初中生・高中生",
          frequency: "每周 1 次起。考试前可咨询追加。",
          body: "根据理解度推进复习、定期考试对策和升学基础。",
        },
        {
          icon: "bot",
          title: "机器人 / 编程",
          audience: "小学生・初中生、首次接触编程的人",
          frequency: "以每月 2 次或每周 1 次为参考。",
          body: "通过机器人制作、Minecraft 编程和 Scratch，边体验边培养逻辑思考。",
        },
        {
          icon: "code-xml",
          title: "实践编程",
          audience: "初中生以上、社会人、想制作作品的人",
          frequency: "每周 1 次起。短期集中可个别咨询。",
          body: "通过接近实际制作的题材学习 Web 开发、后端、数据库和 Git。",
        },
        {
          icon: "monitor-smartphone",
          title: "电脑 / 手机教室",
          audience: "学生、家长、社会人、长者",
          frequency: "单次咨询或每月 2 次起。",
          body: "以实用为中心支持基本操作、Office、安全设置和手机设置。",
        },
        {
          icon: "clipboard-check",
          title: "高卒认定考试对策",
          audience: "准备高卒认定考试或想重新学习的人",
          frequency: "每周 1 次起，按考试科目数调整。",
          body: "一起整理考试科目、学习计划、基础复习和历年题对策。",
        },
      ],
    },
    schedule: {
      eyebrow: "Schedule",
      title: "可咨询方便参加的星期和时间段",
      body: "以下是标准时段。免费体验时会根据学校活动、社团、工作和家庭安排进行调整。",
      dayLabel: "星期",
      timeLabel: "时间段",
      noteLabel: "对象・用途",
      note: "最新空位请在 Schools app 查看。节假日、长假和活动时可能提供其他时段。",
      items: [
        {
          day: "平日",
          time: "16:00-21:00",
          note: "适合放学后、社团后学习以及社会人夜间学习。",
        },
        {
          day: "星期六",
          time: "10:00-18:00",
          note: "适合机器人、编程、考试对策和较长制作时间。",
        },
        {
          day: "星期日・节假日",
          time: "个别咨询",
          note: "可咨询短期集中、活动或考试前追加时段。",
        },
      ],
    },
    faqEyebrow: "FAQ",
    faqTitle: "家长常见问题",
    faqs: [
      {
        question: "免费体验会做什么？",
        answer:
          "确认学习情况、目标和困扰，进行简短体验课，并提出今后的学习方式。家长也可以同席。",
      },
      {
        question: "没有电脑也可以参加吗？",
        answer:
          "根据内容可以介绍借用或替代方法。需要携带的物品会在预约后的确认邮件中说明。",
      },
      {
        question: "学校学习和编程可以一起咨询吗？",
        answer:
          "可以。我们不会把学习塾和 IT 学校完全分开，而是根据目标和时期组合学习支持与编程。",
      },
      {
        question: "授课变更和取消在哪里进行？",
        answer:
          "预约、变更和取消计划在 Schools app 的门户中处理。Acecore Schools 不提供编辑功能。",
      },
      {
        question: "可以从外部日历编辑预约吗？",
        answer:
          "出于安全考虑，Outlook 等外部日历计划为只读。变更和取消从门户进行。",
      },
    ],
    finalCta: {
      title: "从免费体验开始",
      body: "还没决定课程也没关系。我们会根据想学的内容、困扰和可参加时间整理初次内容。",
      primary: "在 Schools app 预约",
      secondary: "通过表单咨询",
    },
  },
  es: {
    trial: {
      eyebrow: "Free Trial",
      title:
        "Empieza con una prueba gratuita para comprobar el estilo de aprendizaje",
      body: "En la primera sesión revisamos la situación actual, objetivos, puntos fuertes y dificultades, y proponemos el curso y la frecuencia adecuados. Las reservas y ajustes se gestionan en Schools app.",
      primaryCta: "Reservar prueba gratuita",
      secondaryCta: "Ver guía de precios",
      note: "Las reservas, cambios y cancelaciones se gestionan en Schools app. Acecore Schools solo publica información de guía.",
      points: [
        "Revisamos objetivos y nivel actual para proponer un primer plan realista.",
        "La familia puede asistir y consultar cómo combinar escuela y estudio en casa.",
        "Tras la reserva online enviamos un correo de confirmación con preparación y acceso.",
      ],
    },
    courses: {
      eyebrow: "Courses",
      title: "Cursos con destinatarios y frecuencia claros",
      body: "Con enseñanza individual, cubrimos desde apoyo escolar hasta programación práctica. La frecuencia se ajusta a los objetivos y rutina.",
      audienceLabel: "Destinatarios",
      frequencyLabel: "Frecuencia",
      items: [
        {
          icon: "book-open",
          title: "Apoyo escolar individual",
          audience: "Primaria, secundaria y bachillerato",
          frequency:
            "Desde una vez por semana. Sesiones extra antes de exámenes.",
          body: "Repaso, preparación de pruebas y bases para exámenes según el nivel de comprensión.",
        },
        {
          icon: "bot",
          title: "Robótica / Programación",
          audience: "Primaria, secundaria y principiantes",
          frequency: "Dos veces al mes o una vez por semana como referencia.",
          body: "Robótica, Minecraft, Scratch y proyectos prácticos para desarrollar pensamiento lógico.",
        },
        {
          icon: "code-xml",
          title: "Programación práctica",
          audience:
            "Desde secundaria, adultos y personas que quieren crear proyectos",
          frequency: "Desde una vez por semana. Intensivos por consulta.",
          body: "Desarrollo web, backend, bases de datos y Git con ejercicios cercanos a la producción real.",
        },
        {
          icon: "monitor-smartphone",
          title: "PC / Smartphone",
          audience: "Estudiantes, familias, adultos y mayores",
          frequency: "Consulta puntual o desde dos veces al mes.",
          body: "Operaciones básicas, Office, seguridad, ajustes de smartphone y tareas digitales cotidianas.",
        },
        {
          icon: "clipboard-check",
          title: "Preparación de equivalencia de secundaria superior",
          audience: "Personas que preparan el examen o retoman estudios",
          frequency: "Desde una vez por semana, según materias.",
          body: "Organización de materias, plan de estudio, repaso básico y ejercicios de exámenes anteriores.",
        },
      ],
    },
    schedule: {
      eyebrow: "Schedule",
      title: "Consulta días y horarios compatibles con tu rutina",
      body: "Estos son horarios estándar. En la prueba gratuita ajustamos según escuela, clubes, trabajo y familia.",
      dayLabel: "Día",
      timeLabel: "Horario",
      noteLabel: "Uso",
      note: "Consulta la disponibilidad actual en Schools app. Festivos, vacaciones y eventos pueden tener otros horarios.",
      items: [
        {
          day: "Entre semana",
          time: "16:00-21:00",
          note: "Después de clase, tras actividades y estudio nocturno para adultos.",
        },
        {
          day: "Sábado",
          time: "10:00-18:00",
          note: "Robótica, programación, exámenes y trabajo de proyecto más largo.",
        },
        {
          day: "Domingo / festivos",
          time: "Consulta individual",
          note: "Intensivos, eventos o sesiones extra antes de exámenes.",
        },
      ],
    },
    faqEyebrow: "FAQ",
    faqTitle: "FAQ para familias",
    faqs: [
      {
        question: "¿Qué se hace en la prueba gratuita?",
        answer:
          "Revisamos situación, objetivos y dudas, hacemos una clase breve y proponemos cómo seguir. La familia puede asistir.",
      },
      {
        question: "¿Se puede participar sin ordenador propio?",
        answer:
          "Según el contenido, podemos proponer préstamo o alternativas. Los materiales necesarios se indican en el correo de confirmación.",
      },
      {
        question:
          "¿Puedo consultar estudios escolares y programación a la vez?",
        answer:
          "Sí. Combinamos apoyo escolar y programación según objetivos y momento, sin separarlos rígidamente.",
      },
      {
        question: "¿Dónde se cambian o cancelan clases?",
        answer:
          "Las reservas, cambios y cancelaciones se gestionarán en el portal de Schools app. Acecore Schools no tendrá funciones de edición.",
      },
      {
        question: "¿Se pueden editar reservas desde calendarios externos?",
        answer:
          "Por seguridad, calendarios como Outlook serán solo lectura. Los cambios y cancelaciones se hacen desde el portal.",
      },
    ],
    finalCta: {
      title: "Empieza con una prueba gratuita",
      body: "No necesitas decidir el curso por adelantado. Organizamos la primera sesión según lo que quieras aprender, tus dudas y tus horarios.",
      primary: "Reservar en Schools app",
      secondary: "Consultar por formulario",
    },
  },
  pt: {
    trial: {
      eyebrow: "Teste gratuito",
      title:
        "Comece com um teste gratuito para confirmar o metodo e a compatibilidade",
      body: "No teste, confirmamos objetivos, situacao atual, dificuldades e disponibilidade antes de propor um primeiro plano realista. A reserva e feita no Schools app.",
      primaryCta: "Reservar teste gratuito",
      secondaryCta: "Ver referencia de precos",
      note: "Reservas e alteracoes sao geridas no Schools app. Acecore Schools funciona como pagina informativa e nao edita reservas.",
      points: [
        "Confirmamos o objetivo de aprendizagem e o nivel atual para propor um plano inicial sem sobrecarga.",
        "Responsaveis podem participar para alinhar objetivos, ritmo e acompanhamento em casa.",
        "A consulta pode incluir apoio escolar, programacao, robotica e preparacao para exames.",
      ],
    },
    courses: {
      eyebrow: "Cursos",
      title: "Cursos com publico-alvo e frequencia claramente indicados",
      body: "Os cursos sao ajustados apos o teste gratuito conforme objetivo, idade, experiencia, disponibilidade e capacidade de concentracao.",
      audienceLabel: "Publico-alvo",
      frequencyLabel: "Frequencia",
      items: [
        {
          title: "Apoio escolar individual",
          audience: "Ensino fundamental, medio e pessoas retomando estudos",
          frequency:
            "A partir de 1 vez por semana. Ajustavel antes de provas ou entregas.",
          body: "Acompanhamos deveres, revisao, dificuldades e planejamento para criar um ritmo sustentavel.",
          icon: "book-open-check",
        },
        {
          title: "Programacao e robotica",
          audience: "Iniciantes, criancas criativas e alunos com experiencia",
          frequency: "Quinzenal ou semanal, conforme o projeto.",
          body: "Aprendizagem por projetos com Minecraft, web, robos e automacoes simples.",
          icon: "bot",
        },
        {
          title: "Aulas de TI para adultos",
          audience:
            "Responsaveis, profissionais, idosos e iniciantes em computador",
          frequency: "Consulta pontual ou a partir de 2 vezes por mes.",
          body: "Uso de PC, ferramentas cloud, IA, seguranca e automacao do dia a dia em ritmo adequado.",
          icon: "laptop",
        },
        {
          title: "Preparacao para equivalencia do ensino medio",
          audience:
            "Pessoas preparando prova de equivalencia ou retomando estudos",
          frequency:
            "A partir de 1 vez por semana, conforme quantidade de materias.",
          body: "Organizacao de materias, plano de estudo, revisao de base e pratica com provas anteriores.",
          icon: "clipboard-check",
        },
      ],
    },
    schedule: {
      eyebrow: "Horario",
      title: "Consulte dias e horarios que se encaixam na rotina",
      body: "Estes sao os horarios padrao. Ajustamos no teste gratuito conforme escola, atividades, trabalho e agenda familiar.",
      dayLabel: "Dia",
      timeLabel: "Horario",
      noteLabel: "Uso",
      note: "As vagas mais recentes sao confirmadas no Schools app. Feriados, ferias e eventos podem ter horarios separados.",
      items: [
        {
          day: "Dias uteis",
          time: "16:00-21:00",
          note: "Depois da escola, apos atividades, ou aulas noturnas para adultos.",
        },
        {
          day: "Sabado",
          time: "10:00-18:00",
          note: "Robotica, programacao, preparacao para exames e projetos mais longos.",
        },
        {
          day: "Domingo / feriados",
          time: "Sob consulta",
          note: "Aulas intensivas, eventos ou horarios extras antes de provas.",
        },
      ],
    },
    faqEyebrow: "FAQ",
    faqTitle: "FAQ para responsaveis",
    faqs: [
      {
        question: "O que acontece no teste gratuito?",
        answer:
          "Revisamos a situacao, objetivos e dificuldades, fazemos uma curta aula experimental e sugerimos os proximos passos. Responsaveis podem acompanhar.",
      },
      {
        question: "E possivel participar sem computador?",
        answer:
          "Dependendo do conteudo, podemos orientar emprestimo ou alternativa. Os itens necessarios sao enviados na confirmacao.",
      },
      {
        question:
          "Podemos conversar sobre escola e programacao ao mesmo tempo?",
        answer:
          "Sim. Combinamos apoio escolar e programacao conforme objetivos e periodo, sem separar em trilhas rigidas.",
      },
      {
        question: "Onde fazer alteracoes ou cancelamentos?",
        answer:
          "Reservas, alteracoes e cancelamentos serao tratados no portal do Schools app. Acecore Schools nao oferece edicao de reservas.",
      },
      {
        question: "Calendarios externos podem editar reservas?",
        answer:
          "Por seguranca, calendarios externos como Outlook serao somente leitura. Alteracoes e cancelamentos ficam no portal.",
      },
    ],
    finalCta: {
      title: "Comece com um teste gratuito",
      body: "Nao e necessario escolher um curso antes. Organizamos a primeira aula com base no que voce quer aprender, nas dificuldades e nos dias disponiveis.",
      primary: "Reservar no Schools app",
      secondary: "Perguntar pelo contato",
    },
  },
  fr: {
    trial: {
      eyebrow: "Essai gratuit",
      title:
        "Commencez par un essai gratuit pour verifier la methode et l'adequation",
      body: "Pendant l'essai, nous confirmons les objectifs, la situation actuelle, les difficultes et les disponibilites avant de proposer un premier plan realiste. La reservation se fait dans la Schools app.",
      primaryCta: "Reserver l'essai gratuit",
      secondaryCta: "Voir les tarifs indicatifs",
      note: "La reservation et les changements sont geres dans la Schools app. Acecore Schools reste une page d'information et ne gere pas les modifications de reservation.",
      points: [
        "Nous verifions l'objectif d'apprentissage et le niveau actuel afin de proposer un premier plan sans surcharge.",
        "Les parents peuvent participer pour discuter des objectifs, du rythme et du suivi a la maison.",
        "La consultation peut couvrir a la fois le soutien scolaire, la programmation, la robotique et la preparation aux examens.",
      ],
    },
    courses: {
      eyebrow: "Cours",
      title: "Des cours avec publics cibles et frequence de lecon clairs",
      body: "Les cours sont ajustes apres l'essai gratuit selon l'objectif, l'age, l'experience, la disponibilite et la capacite de concentration.",
      audienceLabel: "Public cible",
      frequencyLabel: "Frequence",
      items: [
        {
          title: "Soutien scolaire individualise",
          audience:
            "Eleves du primaire, college, lycee, et apprenants en reprise",
          frequency:
            "A partir de 1 fois par semaine. Ajustable avant examens ou rendus.",
          body: "Nous accompagnons les devoirs, les revisions, les lacunes et la planification afin d'installer un rythme durable.",
          icon: "book-open-check",
        },
        {
          title: "Programmation et robotique",
          audience: "Debutants, enfants aimant creer, eleves avec experience",
          frequency:
            "Toutes les deux semaines ou chaque semaine selon le projet.",
          body: "Apprentissage par projets: Minecraft, web, robots et petites automatisations pour relier idees et code.",
          icon: "bot",
        },
        {
          title: "Cours IT pour adultes",
          audience:
            "Parents, adultes actifs, seniors, debutants en informatique",
          frequency: "Consultation ponctuelle ou a partir de 2 fois par mois.",
          body: "Utilisation du PC, outils cloud, IA, securite et automatisation du quotidien, avec un rythme adapte.",
          icon: "laptop",
        },
        {
          title: "Preparation equivalence lycee",
          audience:
            "Apprenants visant l'examen d'equivalence ou souhaitant reprendre les etudes",
          frequency:
            "A partir de 1 fois par semaine, selon le nombre de matieres.",
          body: "Organisation des matieres, plan d'etude, revision des bases et entrainement sur annales avec un plan durable.",
          icon: "clipboard-check",
        },
      ],
    },
    schedule: {
      eyebrow: "Horaires",
      title: "Discutez des jours et horaires compatibles avec votre rythme",
      body: "Voici les creneaux standards. Ils sont ajustes pendant l'essai gratuit selon l'ecole, les clubs, le travail et les contraintes familiales.",
      dayLabel: "Jour",
      timeLabel: "Horaire",
      noteLabel: "Usage",
      note: "Les disponibilites les plus recentes sont confirmees dans la Schools app. Vacances, jours feries et evenements peuvent avoir des creneaux separes.",
      items: [
        {
          day: "Jours de semaine",
          time: "16:00-21:00",
          note: "Apres l'ecole, apres les clubs, ou le soir pour les adultes.",
        },
        {
          day: "Samedi",
          time: "10:00-18:00",
          note: "Robotique, programmation, preparation aux examens et projets longs.",
        },
        {
          day: "Dimanche / jours feries",
          time: "Sur consultation",
          note: "Sessions intensives, evenements ou creneaux supplementaires avant examen.",
        },
      ],
    },
    faqEyebrow: "FAQ",
    faqTitle: "FAQ pour les parents",
    faqs: [
      {
        question: "Que se passe-t-il pendant l'essai gratuit ?",
        answer:
          "Nous examinons la situation, les objectifs et les difficultes, proposons une courte lecon d'essai et expliquons les prochaines etapes. Les parents peuvent assister.",
      },
      {
        question: "Peut-on participer sans posseder d'ordinateur ?",
        answer:
          "Selon le contenu, nous pouvons proposer un pret ou une solution alternative. Le materiel necessaire est indique dans le message de confirmation.",
      },
      {
        question:
          "Peut-on parler a la fois des etudes scolaires et de la programmation ?",
        answer:
          "Oui. Nous combinons soutien scolaire et programmation selon les objectifs et la periode, sans les traiter comme deux parcours separes.",
      },
      {
        question: "Ou gerer les changements ou annulations de lecon ?",
        answer:
          "Les reservations, changements et annulations sont prevus dans le portail de la Schools app. Acecore Schools ne propose pas de fonction de modification.",
      },
      {
        question:
          "Les calendriers externes peuvent-ils modifier les reservations ?",
        answer:
          "Pour des raisons de securite, les calendriers externes comme Outlook sont prevus en lecture seule. Les changements se font depuis le portail.",
      },
    ],
    finalCta: {
      title: "Commencez par un essai gratuit",
      body: "Il n'est pas necessaire de choisir un cours a l'avance. Nous organiserons la premiere seance selon ce que vous voulez apprendre, vos difficultes et vos disponibilites.",
      primary: "Reserver dans la Schools app",
      secondary: "Demander via le contact",
    },
  },
  ko: {
    trial: {
      eyebrow: "무료 체험",
      title: "먼저 무료 체험으로 학습 방식과 적합성을 확인하세요",
      body: "무료 체험에서는 목표, 현재 수준, 어려운 점, 가능한 요일을 확인하고 무리 없는 첫 계획을 제안합니다. 예약은 Schools app에서 진행합니다.",
      primaryCta: "무료 체험 예약하기",
      secondaryCta: "가격 기준 보기",
      note: "예약과 변경은 Schools app에서 관리합니다. Acecore Schools은 안내 페이지이며 예약 편집 기능을 두지 않습니다.",
      points: [
        "학습 목적과 현재 위치를 확인해 무리 없는 첫 계획을 제안합니다.",
        "보호자도 함께 참여해 목표, 수업 빈도, 가정에서의 지원 방법을 상담할 수 있습니다.",
        "학교 공부, 프로그래밍, 로봇, 시험 준비를 함께 상담할 수 있습니다.",
      ],
    },
    courses: {
      eyebrow: "코스",
      title: "대상자와 수업 빈도를 명확히 한 코스",
      body: "무료 체험 후 목표, 나이, 경험, 가능한 시간, 집중 시간에 맞춰 코스를 조정합니다.",
      audienceLabel: "대상자",
      frequencyLabel: "수업 빈도",
      items: [
        {
          title: "개별 학습 지원",
          audience: "초등학생, 중학생, 고등학생, 다시 공부를 시작하는 분",
          frequency: "주 1회부터. 시험 전이나 과제 전에는 조정 가능.",
          body: "숙제, 복습, 취약 부분, 학습 계획을 함께 정리해 지속 가능한 리듬을 만듭니다.",
          icon: "book-open-check",
        },
        {
          title: "프로그래밍 / 로봇",
          audience: "처음 시작하는 학생, 만들기를 좋아하는 어린이, 경험자",
          frequency: "격주 또는 주 1회. 프로젝트 내용에 맞춰 조정.",
          body: "Minecraft, 웹, 로봇, 간단한 자동화 프로젝트로 아이디어와 코드를 연결합니다.",
          icon: "bot",
        },
        {
          title: "성인을 위한 IT 수업",
          audience: "보호자, 직장인, 시니어, 컴퓨터 초보자",
          frequency: "단발 상담 또는 월 2회부터.",
          body: "PC 사용, 클라우드 도구, AI, 보안, 생활 자동화를 각자의 속도에 맞춰 다룹니다.",
          icon: "laptop",
        },
        {
          title: "고졸 인정 시험 대비",
          audience: "고졸 인정 시험을 준비하거나 다시 공부하고 싶은 분",
          frequency: "주 1회부터. 과목 수에 따라 조정.",
          body: "과목 정리, 학습 계획, 기초 복습, 기출 문제 대비를 지속 가능한 계획으로 진행합니다.",
          icon: "clipboard-check",
        },
      ],
    },
    schedule: {
      eyebrow: "일정",
      title: "생활 리듬에 맞는 요일과 시간대를 상담할 수 있습니다",
      body: "아래는 기본 시간대입니다. 학교 행사, 동아리, 직장, 가정 일정에 맞춰 무료 체험 때 개별 조정합니다.",
      dayLabel: "요일",
      timeLabel: "시간대",
      noteLabel: "대상 및 활용",
      note: "최신 빈 자리는 Schools app에서 확인합니다. 공휴일, 방학, 이벤트 시에는 별도 시간대를 안내할 수 있습니다.",
      items: [
        {
          day: "평일",
          time: "16:00-21:00",
          note: "방과 후, 동아리 후 학습, 성인의 야간 학습에 대응합니다.",
        },
        {
          day: "토요일",
          time: "10:00-18:00",
          note: "로봇, 프로그래밍, 시험 대비, 긴 제작 시간에 적합합니다.",
        },
        {
          day: "일요일 / 공휴일",
          time: "개별 상담",
          note: "단기 집중, 이벤트, 시험 전 추가 시간 등을 상담할 수 있습니다.",
        },
      ],
    },
    faqEyebrow: "FAQ",
    faqTitle: "보호자 FAQ",
    faqs: [
      {
        question: "무료 체험에서는 무엇을 하나요?",
        answer:
          "학습 상황, 목표, 어려운 점을 확인하고 짧은 체험 수업과 앞으로의 진행 방법을 제안합니다. 보호자도 함께 참여할 수 있습니다.",
      },
      {
        question: "컴퓨터가 없어도 참여할 수 있나요?",
        answer:
          "내용에 따라 대여나 대체 방법을 안내할 수 있습니다. 필요한 준비물은 예약 후 확인 메일로 안내합니다.",
      },
      {
        question: "학교 공부와 프로그래밍을 함께 상담할 수 있나요?",
        answer:
          "가능합니다. 학습 지원과 프로그래밍을 목표와 시기에 맞춰 조합합니다.",
      },
      {
        question: "수업 변경이나 취소는 어디서 하나요?",
        answer:
          "예약, 변경, 취소는 Schools app 포털에서 처리하는 방향입니다. Acecore Schools에는 편집 기능을 두지 않습니다.",
      },
      {
        question: "외부 캘린더에서 예약을 수정할 수 있나요?",
        answer:
          "안전성을 위해 Outlook 같은 외부 캘린더는 표시 전용으로 할 계획입니다. 변경과 취소는 포털에서 진행합니다.",
      },
    ],
    finalCta: {
      title: "무료 체험으로 시작하세요",
      body: "아직 코스를 정하지 않아도 괜찮습니다. 배우고 싶은 것, 어려운 점, 가능한 요일을 바탕으로 첫 수업 내용을 정리합니다.",
      primary: "Schools app에서 예약하기",
      secondary: "문의로 상담하기",
    },
  },
  de: {
    trial: {
      eyebrow: "Kostenlose Probestunde",
      title: "Mit einer kostenlosen Probestunde Methode und Passung prufen",
      body: "In der Probestunde klaren wir Ziele, aktuellen Stand, Schwierigkeiten und verfugbare Zeiten und schlagen einen realistischen ersten Plan vor. Die Buchung erfolgt in der Schools app.",
      primaryCta: "Kostenlose Probestunde buchen",
      secondaryCta: "Preisubersicht ansehen",
      note: "Buchungen und Anderungen werden in der Schools app verwaltet. Acecore Schools bleibt eine Informationsseite und bietet keine Bearbeitung von Reservierungen.",
      points: [
        "Wir prufen Lernziel und aktuellen Stand, um einen ersten Plan ohne Uberforderung vorzuschlagen.",
        "Eltern konnen teilnehmen, um Ziele, Rhythmus und Begleitung zuhause abzustimmen.",
        "Die Beratung kann Lernunterstutzung, Programmierung, Robotik und Prufungsvorbereitung gemeinsam behandeln.",
      ],
    },
    courses: {
      eyebrow: "Kurse",
      title: "Kurse mit klarer Zielgruppe und Unterrichtshaufigkeit",
      body: "Die Kurse werden nach der kostenlosen Probestunde an Ziel, Alter, Erfahrung, Zeitplan und Konzentrationsspanne angepasst.",
      audienceLabel: "Zielgruppe",
      frequencyLabel: "Haufigkeit",
      items: [
        {
          title: "Individuelle Lernunterstutzung",
          audience: "Grundschule, Mittelstufe, Oberstufe und Wiedereinsteiger",
          frequency:
            "Ab 1-mal pro Woche. Vor Prufungen oder Abgaben anpassbar.",
          body: "Wir begleiten Hausaufgaben, Wiederholung, Lucken und Planung, damit ein nachhaltiger Rhythmus entsteht.",
          icon: "book-open-check",
        },
        {
          title: "Programmierung und Robotik",
          audience: "Anfanger, kreative Kinder und Lernende mit Erfahrung",
          frequency: "Alle zwei Wochen oder wochentlich, je nach Projekt.",
          body: "Projektbasiertes Lernen mit Minecraft, Web, Robotern und einfachen Automatisierungen.",
          icon: "bot",
        },
        {
          title: "IT-Unterricht fur Erwachsene",
          audience: "Eltern, Berufstatige, Senioren und Computer-Anfanger",
          frequency: "Einmalige Beratung oder ab 2-mal pro Monat.",
          body: "PC-Nutzung, Cloud-Tools, KI, Sicherheit und alltagliche Automatisierung im passenden Tempo.",
          icon: "laptop",
        },
        {
          title: "Vorbereitung auf Schulabschluss-Aquivalenz",
          audience:
            "Lernende mit Aquivalenzprufung oder Wiedereinstieg ins Lernen",
          frequency: "Ab 1-mal pro Woche, je nach Anzahl der Facher.",
          body: "Facher ordnen, Lernplan erstellen, Grundlagen wiederholen und mit fruheren Aufgaben uben.",
          icon: "clipboard-check",
        },
      ],
    },
    schedule: {
      eyebrow: "Zeitplan",
      title: "Tage und Zeiten passend zum Alltag abstimmen",
      body: "Dies sind Standardfenster. In der kostenlosen Probestunde passen wir sie an Schule, Vereine, Arbeit und Familie an.",
      dayLabel: "Tag",
      timeLabel: "Zeit",
      noteLabel: "Nutzung",
      note: "Aktuelle Verfugbarkeit wird in der Schools app bestatigt. Feiertage, Ferien und Events konnen eigene Zeitfenster haben.",
      items: [
        {
          day: "Wochentage",
          time: "16:00-21:00",
          note: "Nach der Schule, nach Vereinsaktivitaten oder abends fur Erwachsene.",
        },
        {
          day: "Samstag",
          time: "10:00-18:00",
          note: "Robotik, Programmierung, Prufungsvorbereitung und langere Projektzeiten.",
        },
        {
          day: "Sonntag / Feiertage",
          time: "Nach Absprache",
          note: "Intensivtermine, Events oder Zusatztermine vor Prufungen.",
        },
      ],
    },
    faqEyebrow: "FAQ",
    faqTitle: "FAQ fur Eltern",
    faqs: [
      {
        question: "Was passiert in der kostenlosen Probestunde?",
        answer:
          "Wir besprechen Stand, Ziele und Schwierigkeiten, machen eine kurze Probestunde und schlagen die nachsten Schritte vor. Eltern konnen dabei sein.",
      },
      {
        question: "Kann man ohne eigenen Computer teilnehmen?",
        answer:
          "Je nach Inhalt konnen wir Leihgerate oder Alternativen vorschlagen. Notige Dinge stehen in der Bestatigungsnachricht.",
      },
      {
        question:
          "Kann man Schullernen und Programmierung gemeinsam besprechen?",
        answer:
          "Ja. Wir kombinieren Lernunterstutzung und Programmierung passend zu Ziel und Zeitpunkt, statt sie strikt zu trennen.",
      },
      {
        question: "Wo werden Anderungen oder Stornierungen vorgenommen?",
        answer:
          "Reservierungen, Anderungen und Stornierungen sind im Portal der Schools app vorgesehen. Acecore Schools bietet keine Bearbeitungsfunktion.",
      },
      {
        question: "Konnen externe Kalender Reservierungen bearbeiten?",
        answer:
          "Aus Sicherheitsgrunden sollen externe Kalender wie Outlook nur lesend sein. Anderungen erfolgen im Portal.",
      },
    ],
    finalCta: {
      title: "Mit einer kostenlosen Probestunde starten",
      body: "Ein Kurs muss vorher nicht feststehen. Wir organisieren die erste Stunde nach Lernwunsch, Schwierigkeiten und passenden Tagen.",
      primary: "In der Schools app buchen",
      secondary: "Uber Kontakt fragen",
    },
  },
  ru: {
    trial: {
      eyebrow: "Бесплатное пробное занятие",
      title:
        "Начните с бесплатного пробного занятия, чтобы проверить формат и совместимость",
      body: "На пробном занятии мы уточняем цели, текущий уровень, трудности и доступное время, а затем предлагаем реалистичный первый план. Запись проходит в Schools app.",
      primaryCta: "Записаться на пробное занятие",
      secondaryCta: "Посмотреть ориентир цен",
      note: "Запись и изменения управляются в Schools app. Acecore Schools остается информационной страницей и не редактирует бронирования.",
      points: [
        "Мы уточняем цель обучения и текущий уровень, чтобы предложить первый план без лишней нагрузки.",
        "Родители могут участвовать, чтобы обсудить цели, ритм занятий и поддержку дома.",
        "Можно обсудить учебу в школе, программирование, робототехнику и подготовку к экзаменам вместе.",
      ],
    },
    courses: {
      eyebrow: "Курсы",
      title: "Курсы с понятной аудиторией и частотой занятий",
      body: "Курсы настраиваются после бесплатного пробного занятия с учетом цели, возраста, опыта, расписания и концентрации.",
      audienceLabel: "Для кого",
      frequencyLabel: "Частота",
      items: [
        {
          title: "Индивидуальная учебная поддержка",
          audience:
            "Начальная, средняя и старшая школа, а также возвращение к учебе",
          frequency:
            "От 1 раза в неделю. Можно усилить перед экзаменами или сдачами.",
          body: "Помогаем с домашними заданиями, повторением, пробелами и планом учебы, чтобы выстроить устойчивый ритм.",
          icon: "book-open-check",
        },
        {
          title: "Программирование и робототехника",
          audience:
            "Новички, дети с интересом к созданию проектов, учащиеся с опытом",
          frequency:
            "Раз в две недели или еженедельно, в зависимости от проекта.",
          body: "Проектное обучение с Minecraft, вебом, роботами и простыми автоматизациями.",
          icon: "bot",
        },
        {
          title: "IT-занятия для взрослых",
          audience:
            "Родители, работающие взрослые, пожилые люди и начинающие пользователи ПК",
          frequency: "Разовая консультация или от 2 раз в месяц.",
          body: "ПК, облачные инструменты, ИИ, безопасность и бытовая автоматизация в подходящем темпе.",
          icon: "laptop",
        },
        {
          title: "Подготовка к экзамену на эквивалент старшей школы",
          audience: "Те, кто готовится к экзамену или возвращается к учебе",
          frequency: "От 1 раза в неделю, по числу предметов.",
          body: "Структурируем предметы, план учебы, базовое повторение и практику прошлых заданий.",
          icon: "clipboard-check",
        },
      ],
    },
    schedule: {
      eyebrow: "Расписание",
      title: "Можно согласовать дни и время под ваш ритм",
      body: "Ниже стандартные окна. На пробном занятии мы корректируем их под школу, кружки, работу и семейное расписание.",
      dayLabel: "День",
      timeLabel: "Время",
      noteLabel: "Формат",
      note: "Актуальные свободные окна подтверждаются в Schools app. Праздники, каникулы и события могут иметь отдельные окна.",
      items: [
        {
          day: "Будни",
          time: "16:00-21:00",
          note: "После школы, после кружков или вечерние занятия для взрослых.",
        },
        {
          day: "Суббота",
          time: "10:00-18:00",
          note: "Робототехника, программирование, подготовка к экзаменам и длинные проектные блоки.",
        },
        {
          day: "Воскресенье / праздники",
          time: "По согласованию",
          note: "Интенсивы, события или дополнительные окна перед экзаменами.",
        },
      ],
    },
    faqEyebrow: "FAQ",
    faqTitle: "FAQ для родителей",
    faqs: [
      {
        question: "Что происходит на бесплатном пробном занятии?",
        answer:
          "Мы обсуждаем текущую ситуацию, цели и трудности, проводим короткое пробное занятие и предлагаем следующие шаги. Родители могут присутствовать.",
      },
      {
        question: "Можно ли участвовать без своего компьютера?",
        answer:
          "В зависимости от занятия мы можем предложить аренду или альтернативный вариант. Нужные вещи указаны в подтверждении записи.",
      },
      {
        question: "Можно ли обсудить и школьную учебу, и программирование?",
        answer:
          "Да. Мы комбинируем учебную поддержку и программирование по целям и срокам, не разделяя их жестко.",
      },
      {
        question: "Где менять или отменять занятия?",
        answer:
          "Бронирования, изменения и отмены планируются в портале Schools app. Acecore Schools не предоставляет функции редактирования.",
      },
      {
        question: "Могут ли внешние календари изменять бронирования?",
        answer:
          "Для безопасности внешние календари, например Outlook, планируются только для просмотра. Изменения выполняются в портале.",
      },
    ],
    finalCta: {
      title: "Начните с бесплатного пробного занятия",
      body: "Не нужно заранее выбирать курс. Мы организуем первое занятие по тому, чему вы хотите научиться, где нужна помощь и какие дни подходят.",
      primary: "Записаться в Schools app",
      secondary: "Задать вопрос через контакт",
    },
  },
} satisfies Record<Locale, SchoolsDetailContent>;
