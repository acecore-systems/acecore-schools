export const schoolsContent = {
  title: "Acecore Schools",
  description:
    "Acecore Schoolsは、高卒認定、IT・プログラミング、PC・スマホ活用、ロボット／メイキングを、一人ひとりの目的に合わせて組み立てる学習スクールです。",
  nav: [
    { key: "learning", label: "学べること", href: "/learning/" },
    {
      key: "how-it-works",
      label: "学び方",
      href: "/how-it-works/",
    },
    { key: "pricing", label: "料金", href: "/pricing/" },
    { key: "about", label: "Schoolsについて", href: "/about/" },
    { key: "faq", label: "よくある質問", href: "/faq/" },
  ],
  search: {
    navLabel: "サイト内検索",
    eyebrow: "SITE SEARCH",
    title: "知りたいことを検索",
    body: "学びたい内容や料金、受講方法について、Acecore Schoolsの公開ページから探せます。",
    formLabel: "検索キーワード",
    placeholder: "例：高卒認定とIT学習を組み合わせたい",
    hint: "2〜160文字で入力してください。",
    submit: "検索する",
    loading: "検索しています…",
    resultsTitle: "検索結果",
    resultCountSuffix: "件見つかりました。",
    noResults:
      "該当する内容が見つかりませんでした。言葉を変えて、もう一度お試しください。",
    validation: "検索キーワードを2〜160文字で入力してください。",
    viewResult: "ページを見る",
    fallbackTitle: "Acecore Schoolsのページ",
    fallbackExcerpt: "ページで詳しい内容をご確認ください。",
    errors: {
      rateLimited:
        "検索が混み合っています。1分ほど時間をおいて、もう一度お試しください。",
      provider:
        "検索サービスとの通信に失敗しました。少し時間をおいて、もう一度お試しください。",
      unavailable:
        "現在、サイト内検索を利用できません。各ページはメニューから確認できます。",
      network:
        "通信できませんでした。接続状況を確認して、もう一度お試しください。",
      generic:
        "検索中に問題が発生しました。少し時間をおいて、もう一度お試しください。",
    },
    noscript:
      "サイト内検索にはJavaScriptが必要です。各ページはメニューから確認できます。",
  },
  hero: {
    title: "何のために。",
    lead: "目的から、必要な学びを組み立てる。",
    body: "学歴や決められた順番より、いま何を変えたいのか。その目的に必要な学びを、一緒に整理して実践へつなげます。",
    primary: "無料相談を申し込む",
    secondary: "学べることを見る",
    imageAlt: "都市の中でこれからの進路を考える、バックパックを背負った若者",
  },
  purposes: [
    {
      icon: "ph-book-open",
      title: "高卒認定を取り、\nその先を考えたい",
      href: "/learning/#ged",
      tone: "navy",
    },
    {
      icon: "ph-code",
      title: "IT・プログラミングを\n実践で学びたい",
      href: "/learning/#programming",
      tone: "green",
    },
    {
      icon: "ph-devices",
      title: "PC・スマホを\n生活や仕事で使いたい",
      href: "/learning/#digital",
      tone: "navy",
    },
    {
      icon: "ph-robot",
      title: "ロボット／メイキングの\n実施方法を相談したい",
      href: "/learning/#making",
      tone: "green",
    },
  ],
  support: {
    title: "一人ひとりに、\n必要な支えを。",
    body: "目標も、得意なことも、使える時間も人それぞれ。決まったコースへ当てはめるのではなく、話しながら学び方を組み直します。",
    imageAlt: "自宅からビデオ通話で相談しながらノートを取る受講者",
    audience: {
      label: "対象",
      title: "学生から社会人、シニアまで。",
      body: "年齢や肩書きで一律に区切らず、いまの目的と現在地から必要な学びを考えます。",
    },
    points: [
      {
        icon: "ph-target",
        title: "目的を整理する",
        body: "やりたいこと、困っていることを言葉にし、いま必要な一歩を明確にします。",
      },
      {
        icon: "ph-notebook",
        title: "必要な学びを組み立てる",
        body: "基礎や資格、実践、活用を組み合わせ、目的までの順番を考えます。",
      },
      {
        icon: "ph-pencil-line",
        title: "手を動かして試す",
        body: "覚えるだけで終わらせず、解く、つくる、設定する、動かすことで確かめます。",
      },
      {
        icon: "ph-arrows-clockwise",
        title: "振り返って見直す",
        body: "目的や状況が変わったら、内容とペースをその都度組み直します。",
      },
    ],
  },
  areas: [
    {
      id: "ged",
      number: "01",
      icon: "ph-book-open",
      title: "高卒認定・その先の選択",
      purpose: "進むために。",
      body: "必要科目と現在地を整理し、試験までの学習計画をつくります。認定取得を終点にせず、進学や仕事など、その先の選択も見据えます。",
      examples: [
        "必要科目と現在地の確認",
        "過去問・模試を使った試験対策",
        "受験時期から逆算した学習計画",
        "進学・仕事など次の選択",
      ],
      image: "/images/schools/purpose-city/area-ged.webp",
      imageAlt: "高卒認定に向けて教材とノートで学習する若者",
    },
    {
      id: "programming",
      number: "02",
      icon: "ph-code",
      title: "IT学習・プログラミング",
      purpose: "つくるために。",
      body: "Webサイトや小さなツールを実際に形にしながら、仕組みと基礎を学びます。知識だけでなく、自分で試して改善する力を育てます。",
      examples: [
        "HTML・CSS・JavaScript",
        "Python・Node.js",
        "データベース・API・クラウド",
        "Git・公開までの流れ",
      ],
      image: "/images/schools/purpose-city/area-programming.webp",
      imageAlt: "自宅のノートパソコンでWeb制作に取り組む若者",
    },
    {
      id: "digital",
      number: "03",
      icon: "ph-devices",
      title: "PC・スマホ活用",
      purpose: "使うために。",
      body: "資料づくり、調べもの、各種設定、オンラインでの連絡など、暮らしや仕事の実際の用事を題材に、使えるところまで支援します。",
      examples: [
        "PC・スマホの基本操作と設定",
        "Word・Excel・PowerPoint",
        "メール・SNS・オンライン会議",
        "セキュリティ・トラブル対応",
      ],
      image: "/images/schools/purpose-city/area-digital.webp",
      imageAlt: "パソコンとスマートフォンを使って資料を整理する受講者",
    },
    {
      id: "making",
      number: "04",
      icon: "ph-circuitry",
      title: "ロボット／メイキング",
      purpose: "確かめるために。",
      body: "部品を組み、回路をつなぎ、実際の動きを確かめる分野です。プログラミングとは分けて機構・電子・制御を扱い、実施方法や時期は内容に応じて相談します。",
      examples: [
        "機構・部品の組み立て",
        "電子回路・配線",
        "制御と動作確認",
        "実施方法・時期の相談",
      ],
      image: "/images/schools/purpose-city/area-making.webp",
      imageAlt: "机の上で小型ロボットの機構と配線を調整する若者",
    },
  ],
  process: {
    eyebrow: "HOW WE LEARN",
    title: "学びの進め方",
    body: "途中で目的が変わっても、学び方は変えていい。相談と実践を往復しながら、その時の自分に必要な形へ更新します。",
    steps: [
      {
        number: "01",
        icon: "ph-chats-circle",
        title: "話して、整理する",
        body: "いまの状況と、できるようになりたいことを共有します。",
      },
      {
        number: "02",
        icon: "ph-notebook",
        title: "内容と順番を決める",
        body: "必要な基礎、課題、実践を組み合わせて計画します。",
      },
      {
        number: "03",
        icon: "ph-pencil-line",
        title: "手を動かす",
        body: "問題を解く、制作する、設定する、動かすことで身につけます。",
      },
      {
        number: "04",
        icon: "ph-arrows-clockwise",
        title: "振り返り、組み直す",
        body: "進み方と目的を確認し、内容やペースを調整します。",
      },
    ],
  },
  supportSystem: {
    title: "学び方・サポート体制",
    items: [
      {
        icon: "ph-user-focus",
        title: "個別に組み立てる",
        body: "決まった順番ではなく、目的と現在地から内容を決めます。",
      },
      {
        icon: "ph-calendar-dots",
        title: "生活に合わせて相談",
        body: "仕事や学校、家庭の予定を踏まえて、続けやすい進め方を考えます。",
      },
      {
        icon: "ph-chats-circle",
        title: "質問と対話",
        body: "分からないところをそのままにせず、相談しながら進めます。",
      },
      {
        icon: "ph-file-text",
        title: "教材と実践課題",
        body: "目的に合わせた教材と、実際に使うための課題を組み合わせます。",
      },
    ],
  },
  outcomes: {
    eyebrow: "LEARNING IN USE",
    title: "学びの先で\n目指せること",
    body: "以下は取り組み方の一例です。目指すゴールは、一人ひとりの目的と現在地に合わせて決めます。",
    items: [
      {
        image: "/images/schools/purpose-city/outcome-plan.webp",
        imageAlt: "教材とカレンダーを使って整理された学習計画",
        label: "高卒認定",
        title: "試験までの道筋を、自分で確認する",
      },
      {
        image: "/images/schools/purpose-city/outcome-web.webp",
        imageAlt: "ノートパソコンに表示された制作中のWebページ",
        label: "プログラミング",
        title: "Webページや小さなツールの公開を目指す",
      },
      {
        image: "/images/schools/purpose-city/outcome-digital.webp",
        imageAlt: "パソコンとスマートフォンで整理された実用的な資料",
        label: "PC・スマホ",
        title: "仕事や生活の用事を、自分で進める力をつける",
      },
      {
        image: "/images/schools/purpose-city/outcome-making.webp",
        imageAlt: "机の上で完成した小型ロボットと工具",
        label: "ロボット／メイキング",
        title: "仕組みを組み立て、動きを確かめる",
      },
    ],
  },
  activity: {
    eyebrow: "PAST ACTIVITY",
    title: "これまでの取り組み",
    body: "2023年夏季限定で、対面のロボット工作体験を実施しました。",
    note: "現在開催中の講座ではありません。対面企画を実施する際は、サイトでお知らせします。",
    status: "募集終了",
    href: "/activities/2023-summer-robot-workshop/",
    linkLabel: "2023年夏の活動記録を詳しく見る",
    imageAlt: "ロボットの組み立てと動作確認を表したイメージビジュアル",
  },
  activityRecord: {
    eyebrow: "ACTIVITY RECORD",
    title: "2023年夏のロボット工作体験",
    description:
      "Acecore Schoolsが2023年夏に小中学生を対象として実施した、対面ロボット工作体験の活動記録です。募集は終了しています。",
    status: "募集終了",
    lead: "機構を組み立て、改造し、実際の動きを確かめることを通じて、ものづくりを体験する夏季限定イベントを実施しました。",
    imageAlt: "ロボットの組み立てと動作確認を表したイメージビジュアル",
    imageCaption: "活動内容を表したイメージビジュアルです。",
    displayDate: "2023年8月20日・27日",
    dateTime: "2023-08",
    locationName: "桜台市民センター 3階 講座室2",
    publishedAt: "2023-07-19",
    modifiedAt: "2026-07-30",
    eventDates: [
      {
        label: "2023年8月20日",
        startDate: "2023-08-20T14:00:00+09:00",
        endDate: "2023-08-20T15:30:00+09:00",
      },
      {
        label: "2023年8月27日",
        startDate: "2023-08-27T14:00:00+09:00",
        endDate: "2023-08-27T15:30:00+09:00",
      },
    ],
    facts: [
      { label: "対象", value: "小学生〜中学生（幼児は相談）" },
      {
        label: "場所",
        value: "桜台市民センター 3階 講座室2",
      },
      { label: "開催日", value: "2023年8月20日・27日" },
      { label: "時間", value: "各日14:00開始（90分間）" },
      {
        label: "内容",
        value: "45分の工作＋45分の改造・動作体験",
      },
      { label: "参加費", value: "1人1回 2,000円（教材費込み）" },
      {
        label: "教材",
        value: "タミヤ 楽しい工作シリーズ（持ち帰り）",
      },
      { label: "定員", value: "各回10名（要予約）" },
    ],
    sections: [
      {
        title: "実施したこと",
        paragraphs: [
          "工作、改造、動作確認を一つずつ重ね、仕組みを手で確かめる時間としました。完成後は、動きを見ながら機構を調整しました。",
          "このイベントはプログラミング教室ではなく、ロボットの機構と動きを扱うメイキング体験として実施したものです。自由研究にも活用できる内容として案内しました。",
        ],
      },
      {
        title: "当時の特典",
        paragraphs: [
          "当時は、LINE登録者を対象に200円の割引を実施しました。現在利用できる特典ではありません。",
        ],
      },
      {
        title: "現在のご案内",
        paragraphs: [
          "このイベントの募集は終了しています。現在、通常の学習サポートはオンラインで提供しています。",
          "対面のロボット／メイキングは常設ではありません。今後、対面企画を実施する場合は、このサイトでお知らせします。",
        ],
      },
    ],
  },
  delivery: {
    eyebrow: "CURRENT FORMAT",
    title: "現在の受講方法",
    body: "現在、通常の学習サポートはオンラインで提供しています。",
    note: "必要な機器や接続方法は、学ぶ内容とお手持ちの環境を確認してご案内します。",
    items: [
      { icon: "ph-wifi-high", label: "安定したインターネット環境" },
      { icon: "ph-laptop", label: "PCまたは内容に合う端末" },
      { icon: "ph-chats-circle", label: "ビデオ通話・画面共有" },
    ],
  },
  pricing: {
    eyebrow: "PRICE GUIDE",
    title: "受講料金の目安",
    body: "目的、内容、回数、利用する教材・環境に合わせて変動します。受講前に正式な金額をご案内します。",
    items: [
      {
        icon: "ph-sign-in",
        label: "入会金",
        amount: "1.1万〜2.2万円",
        note: "初回のみ。支援内容や準備物により変動します。",
      },
      {
        icon: "ph-calendar-dots",
        label: "月謝",
        amount: "8千〜3.3万円",
        note: "回数、時間、支援内容、進め方により変動します。",
      },
      {
        icon: "ph-books",
        label: "教材・管理費",
        amount: "5千〜3万円程度",
        note: "教材、ロボット部材、PC・ライセンス費などは内容により実費が発生します。",
      },
    ],
    note: "すべて税込の目安です。教材、機材、交通費などの外部実費は別途となる場合があります。",
    cta: "料金について無料相談する",
  },
  acecore: {
    eyebrow: "ACECORE NETWORK",
    title: "現場の技術を、学びへつなぐ。",
    body: "Acecoreは、Web制作・サーバー運用・デザインなどを横断して支援しています。Schoolsは、その現場で培う視点を学習支援へつなぐAcecoreの教育事業です。",
    principle: "技術、運用、表現、教育を分断せず、一つの支援線として扱う。",
    links: [
      { label: "Acecoreの事業", href: "/services/" },
      { label: "Acecoreについて", href: "/about/" },
      { label: "Acecoreのニュース", href: "/blog/" },
    ],
  },
  consultation: {
    eyebrow: "GET STARTED",
    title: "迷ったら、まずは相談してみませんか？",
    body: "相談は無料です。学ぶ内容が決まっていなくても、いまの状況と、できるようになりたいことから一緒に整理します。",
    cta: "LINEで無料相談する",
    formCta: "フォームで無料相談する",
    beforeStart: {
      eyebrow: "BEFORE YOU START",
      title: "受講を決める前に確認できること",
      body: "無料相談後のご提案で、内容と条件をまとめてご案内します。確認してから、受講するかどうかを決められます。",
      items: [
        { icon: "ph-books", label: "扱う内容とゴール" },
        { icon: "ph-calendar-dots", label: "進め方・頻度" },
        { icon: "ph-laptop", label: "必要な機器・教材" },
        { icon: "ph-receipt", label: "受講にかかる費用" },
      ],
    },
    steps: [
      {
        number: "01",
        title: "無料相談",
        body: "目的や困っていることを聞かせてください。",
      },
      {
        number: "02",
        title: "学び方のご提案",
        body: "内容、順番、ペースを一緒に整理します。",
      },
      {
        number: "03",
        title: "受講スタート",
        body: "納得できる形が決まってから始めます。",
      },
    ],
  },
  faq: {
    title: "よくあるご質問",
    items: [
      {
        question: "学びたいことが決まっていなくても相談できますか？",
        answer:
          "はい。いま困っていることや、できるようになりたいことから整理できます。相談の段階でコースを決めておく必要はありません。",
      },
      {
        question: "パソコンやプログラミングが初めてでも大丈夫ですか？",
        answer:
          "大丈夫です。使っている機器や経験を確認し、操作の基礎から必要な順番で進めます。",
      },
      {
        question: "高卒認定とIT学習を組み合わせることはできますか？",
        answer:
          "目的や時期を確認したうえで、必要な学びを組み合わせて順番を考えます。内容は相談時に一緒に整理します。",
      },
      {
        question: "高卒認定以外の学校学習や試験対策も相談できますか？",
        answer:
          "はい。定期テストや受験対策なども、現在地と目的に合わせて相談できます。対応内容や進め方は、無料相談で状況を確認してからご案内します。",
      },
      {
        question: "学生以外でも受講できますか？",
        answer:
          "はい。学生、社会人、シニアまで、年齢ではなく目的と現在地を確認して内容を組み立てます。",
      },
      {
        question: "料金はいつ分かりますか？",
        answer:
          "料金ページに入会金、月謝、教材・管理費の目安を掲載しています。正式な金額は、目的や進め方を確認したうえで、受講を決める前にご案内します。",
      },
      {
        question: "受講に必要な機器はありますか？",
        answer:
          "学ぶ内容とお手持ちの環境を確認し、必要な機器や接続方法を事前にご案内します。",
      },
      {
        question: "対面のロボット教室は開催していますか？",
        answer:
          "現在開催中の常設講座ではありません。2023年夏季限定で対面のロボット工作体験を実施しました。今後、対面企画を行う際はサイトでお知らせします。",
      },
    ],
  },
  footer: {
    tagline:
      "Acecoreの教育事業として、あなたの「何のために。」から学びを支えます。",
  },
} as const;

export const schoolsOrigin = "https://schools.acecore.net";
export const acecoreOrigin = "https://acecore.net";
export const acecoreContactUrl =
  "https://acecore.net/contact/?category=service&service=education#contact-form";
export const lineUrl = "https://lin.ee/DjIrdqj";
