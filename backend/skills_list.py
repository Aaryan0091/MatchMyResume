"""
Custom skills list for catching domain-specific technical skills that spaCy may miss.
This covers programming languages, frameworks, cloud platforms, databases, DevOps tools, and soft skills.
"""

CUSTOM_SKILLS = [
    # Programming Languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C", "Go", "Rust", "Ruby", "PHP",
    "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl", "Lua", "Dart", "Objective-C", "Shell",
    "Bash", "PowerShell", "SQL", "HTML", "CSS", "Sass", "Less", "CoffeeScript", "Elm", "Elixir",
    "Haskell", "Clojure", "F#", "Groovy", "Julia", "Crystal", "Nim", "V", "Zig", "Assembly",

    # Web Frameworks & Libraries
    "React", "Angular", "Vue", "Svelte", "Next.js", "Nuxt.js", "Express", "Flask", "Django", "FastAPI",
    "Spring Boot", "Ruby on Rails", "Laravel", "ASP.NET", "NestJS", "Remix", "Gatsby", "Gridsome",
    "Ember.js", "Backbone.js", "Meteor", "Phoenix", "Play Framework", "ASP.NET Core", "Nancy",
    "Koa", "Hapi", "AdonisJS", "Feathers", "LoopBack", "Sails", "Moleculer", "MoleculerJS",

    # Frontend Libraries
    "Redux", "MobX", "Zustand", "Recoil", "Jotai", "Apollo", "Relay", "GraphQL", "jQuery",
    "Bootstrap", "Tailwind CSS", "Bulma", "Foundation", "Material UI", "Ant Design", "Chakra UI",
    "Shadcn", "Radix UI", "Headless UI", "Emotion", "Styled Components", "JSS", "Sass", "Less",
    "PostCSS", "Webpack", "Vite", "Parcel", "Rollup", "Esbuild", "Snowpack", "Turbopack",

    # Backend Frameworks
    "Node.js", "Express.js", "Fastify", "Koa", "Hapi", "NestJS", "AdonisJS", "Sails",
    "Flask", "Django", "FastAPI", "Pyramid", "Tornado", "Bottle", "CherryPy", "Web2py",
    "Spring", "Spring Boot", "Spring Cloud", "Micronaut", "Quarkus", "Javalin", "Vert.x",
    "ASP.NET", "ASP.NET Core", "Nancy", "ServiceStack", "Akka", "Play Framework", "Lagom",
    "Ruby on Rails", "Sinatra", "Padrino", "Hanami", "Laravel", "Symfony", "CodeIgniter",

    # Databases
    "MySQL", "PostgreSQL", "SQLite", "MongoDB", "Redis", "Cassandra", "DynamoDB", "Couchbase",
    "Neo4j", "MariaDB", "Oracle", "SQL Server", "DB2", "Snowflake", "BigQuery", "Redshift",
    "Firebird", "H2", "HSQLDB", "Derby", "InfluxDB", "TimescaleDB", "Promscale", "QuestDB",
    "ClickHouse", "ScyllaDB", "YugabyteDB", "TiDB", "CockroachDB", "FoundationDB", "BadgerDB",
    "RethinkDB", "ArangoDB", "OrientDB", "MultiModel", "Firestore", "Firebase Realtime Database",

    # ORM / Database Tools
    "Prisma", "Sequelize", "TypeORM", "Mongoose", "SQLAlchemy", "Hibernate", "Dapper",
    "Entity Framework", "GORM", "ActiveRecord", "Querydsl", "JPA", "Knex.js", "Objection.js",
    "Bookshelf", "MikroORM", "Doctrine", "Propel", "DataMapper", "Datamapper", "DBIx",
    "PDO", "ADO.NET", "JDBC", "R2DBC", "MyBatis", "JOOQ", "Slick", "Quill", "Doobie",

    # Cloud Platforms & Services
    "AWS", "Amazon Web Services", "Amazon EC2", "Amazon S3", "Amazon RDS", "Amazon DynamoDB",
    "Amazon Lambda", "Amazon API Gateway", "Amazon ECS", "Amazon EKS", "Amazon Fargate",
    "AWS CloudFormation", "AWS CDK", "AWS SAM", "Terraform", "Azure", "Microsoft Azure",
    "Azure Functions", "Azure App Service", "Azure SQL", "Azure Cosmos DB", "Azure Blob Storage",
    "Azure DevOps", "Azure Pipelines", "GCP", "Google Cloud Platform", "Google Cloud Functions",
    "Google Compute Engine", "Google Cloud Storage", "Google Cloud SQL", "Google Cloud Firestore",
    "Google Cloud Pub/Sub", "Kubernetes Engine", "Heroku", "DigitalOcean", "Linode", "Vultr",
    "IBM Cloud", "Oracle Cloud", "Alibaba Cloud", "Tencent Cloud", "Cloudflare", "Netlify",
    "Vercel", "Firebase", "Amplify", "Appwrite", "Supabase", "PlanetScale", "Neon", "CockroachDB",

    # DevOps & Infrastructure
    "Docker", "Kubernetes", "K8s", "Docker Compose", "Helm", "Kustomize", "Ansible",
    "Terraform", "Pulumi", "Chef", "Puppet", "SaltStack", "Vagrant", "Packer",
    "Jenkins", "GitLab CI", "GitHub Actions", "CircleCI", "Travis CI", "Bitbucket Pipelines",
    "TeamCity", "Bamboo", "GoCD", "Concourse", "Spinnaker", "ArgoCD", "Flux", "Drone",
    "Nginx", "Apache", "HAProxy", "Traefik", "Caddy", "Envoy", "Istio", "Linkerd",
    "Prometheus", "Grafana", "ELK Stack", "Elasticsearch", "Logstash", "Kibana", "Fluentd",
    "Fluent Bit", "Loki", "Jaeger", "Zipkin", "Datadog", "New Relic", "Splunk", "Sentry",

    # Version Control & Collaboration
    "Git", "GitHub", "GitLab", "Bitbucket", "GitHub Actions", "GitLab CI/CD", "Subversion",
    "Mercurial", "CVS", "Perforce", "Jira", "Confluence", "Trello", "Asana", "Notion",
    "Monday.com", "Linear", "Shortcut", "Clubhouse", "Pivotal Tracker", "VersionOne",

    # Testing & Quality Assurance
    "Jest", "Mocha", "Chai", "Sinon", "Jasmine", "Karma", "QUnit", "Ava", "Tape",
    "Jest", "Vitest", "Jest DOM", "React Testing Library", "Testing Library", "Cypress",
    "Playwright", "Selenium", "Puppeteer", "WebdriverIO", "TestCafe", "Appium",
    "PyTest", "Pytest", "unittest", "nose2", "doctest", "behave", "Robot Framework",
    "JUnit", "TestNG", "Mockito", "PowerMock", "EasyMock", "RSpec", "MiniTest",
    "Minitest", "Cucumber", "Gherkin", "SpecFlow", "Behave", "Lettuce", "Capybara",

    # API & Integration
    "REST API", "RESTful API", "REST", "SOAP", "GraphQL", "gRPC", "WebSocket", "WebSockets",
    "Socket.IO", "MQTT", "AMQP", "RabbitMQ", "Kafka", "Apache Kafka", "Apache Pulsar",
    "Redis Streams", "NATS", "ZeroMQ", "ActiveMQ", "Amazon SQS", "Amazon SNS",
    "Google Pub/Sub", "Azure Service Bus", "Event Hubs", "OpenAPI", "Swagger",
    "OpenAPI Specification", "Postman", "Insomnia", "SoapUI", "REST Assured",

    # Authentication & Security
    "OAuth", "OAuth2", "OpenID Connect", "OIDC", "JWT", "JSON Web Tokens", "SAML",
    "LDAP", "Active Directory", "Kerberos", "Passport.js", "Auth0", "Okta", "Keycloak",
    "Firebase Auth", "AWS Cognito", "Azure AD", "Google Identity Platform", "SSL",
    "TLS", "HTTPS", "SSH", "HTTPS", "HSTS", "CORS", "CSRF", "XSS", "SQL Injection",
    "OWASP", "Security", "Penetration Testing", "Vulnerability Assessment", "Burp Suite",

    # Machine Learning & Data Science
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "scikit-learn", "Pandas", "NumPy",
    "Matplotlib", "Seaborn", "Plotly", "Jupyter", "Jupyter Notebook", "JupyterLab",
    "Google Colab", "Kaggle", "Data Science", "Machine Learning", "Deep Learning",
    "Neural Networks", "NLP", "Natural Language Processing", "Computer Vision", "CNN",
    "RNN", "LSTM", "Transformer", "BERT", "GPT", "LLM", "Large Language Model",
    "OpenAI", "LangChain", "Hugging Face", "spaCy", "NLTK", "OpenCV", "XGBoost",
    "LightGBM", "CatBoost", "MLflow", "Weights & Biases", "DVC", "Airflow",
    "Prefect", "Dagster", "Apache Spark", "PySpark", "Hadoop", "Hive", "Presto",
    "Trino", "Druid", "Pinot", "ClickHouse", "Databricks", "Snowflake", "BigQuery",

    # Mobile Development
    "React Native", "Flutter", "Ionic", "Cordova", "PhoneGap", "Capacitor",
    "NativeScript", "Expo", "Xamarin", "Kotlin Multiplatform", "Android Studio",
    "Android", "iOS", "Swift", "Objective-C", "Jetpack Compose", "SwiftUI",
    "UIKit", "Android SDK", "Android NDK", "Gradle", "CocoaPods", "Swift Package Manager",

    # Development Tools & IDEs
    "VS Code", "Visual Studio Code", "IntelliJ IDEA", "PyCharm", "WebStorm", "PhpStorm",
    "RubyMine", "GoLand", "CLion", "AppCode", "DataGrip", "Rider", "Android Studio",
    "Xcode", "Visual Studio", "Eclipse", "NetBeans", "Atom", "Sublime Text", "Vim",
    "Neovim", "Emacs", "Brackets", "Notepad++", "TextMate", "Sublime Merge", "GitKraken",
    "SourceTree", "Tower", "Fork", "GitHub Desktop", "GitLab Desktop", "Sourcetree",

    # Build Tools & Package Managers
    "npm", "yarn", "pnpm", "Bun", "pip", "pipenv", "poetry", "conda", "Maven",
    "Gradle", "Ant", "Ivy", "SBT", "Leiningen", "Boot", "Cargo", "Rust", "Go Modules",
    "Dep", "Glide", "Composer", "NuGet", "Chocolatey", "Homebrew", "apt", "yum",
    "dnf", "pacman", "apk", "pip", "npm", "yarn", "pnpm", "Bun", "Webpack", "Vite",
    "Parcel", "Rollup", "Esbuild", "Snowpack", "Turbopack", "Browserify", "Grunt",
    "Gulp", "Babel", "SWC", "ESLint", "Prettier", "Stylelint", "Husky", "lint-staged",

    # Monitoring & Observability
    "Prometheus", "Grafana", "Datadog", "New Relic", "Splunk", "AppDynamics", "Dynatrace",
    "Elastic APM", "Sentry", "Bugsnag", "Rollbar", "Honeybadger", "Airbrake", "PagerDuty",
    "Opsgenie", "VictorOps", "xMatters", "PagerTree", "Uptime Robot", "Pingdom",
    "StatusCake", "Better Uptime", "Healthchecks.io", "Uptime Kuma", "Grafana Loki",
    "ELK Stack", "EFK Stack", "Elasticsearch", "Logstash", "Kibana", "Fluentd",

    # Soft Skills
    "Communication", "Leadership", "Teamwork", "Problem Solving", "Critical Thinking",
    "Time Management", "Organization", "Adaptability", "Flexibility", "Creativity",
    "Innovation", "Analytical Skills", "Decision Making", "Strategic Thinking", "Planning",
    "Project Management", "Agile", "Scrum", "Kanban", "Waterfall", "SAFe", "Lean",
    "Mentoring", "Coaching", "Training", "Public Speaking", "Presentation Skills",
    "Negotiation", "Conflict Resolution", "Collaboration", "Cross-functional",
    "Interpersonal Skills", "Emotional Intelligence", "Empathy", "Patience",
    "Attention to Detail", "Self-motivation", "Self-directed", "Initiative",
    "Results-oriented", "Customer Service", "Client Relations", "Stakeholder Management",
    "Vendor Management", "Risk Management", "Quality Assurance", "Process Improvement",
    "Continuous Improvement", "Change Management", "Innovation Management",

    # Business & Domain Skills
    "Product Management", "Product Strategy", "Roadmap", "User Research", "User Experience",
    "UX", "User Interface", "UI", "Design Thinking", "Service Design", "Business Analysis",
    "Requirements Gathering", "Technical Writing", "Documentation", "Knowledge Sharing",
    "Technical Documentation", "API Documentation", "Software Architecture", "System Design",
    "Database Design", "Data Modeling", "Data Analysis", "Data Visualization", "Reporting",
    "Business Intelligence", "Analytics", "Metrics", "KPIs", "OKRs", "Goal Setting",
    "Budgeting", "Forecasting", "Resource Planning", "Capacity Planning", "Vendor Selection",
    "Contract Negotiation", "SLA Management", "Compliance", "Governance", "Auditing",

    # Additional Technical Skills
    "CI/CD", "DevOps", "SRE", "Site Reliability Engineering", "Cloud Native", "Serverless",
    "Microservices", "Monolith", "SOA", "Event-Driven Architecture", "EDA", "CQRS",
    "Event Sourcing", "Domain-Driven Design", "DDD", "Test-Driven Development", "TDD",
    "Behavior-Driven Development", "BDD", "Acceptance Test-Driven Development", "ATDD",
    "Pair Programming", "Code Review", "Pull Request", "Merge Request", "Code Quality",
    "Technical Debt", "Refactoring", "Clean Code", "SOLID", "DRY", "KISS", "YAGNI",
    "Design Patterns", "Architectural Patterns", "Enterprise Patterns", "Anti-Patterns",
    "Performance Optimization", "Scalability", "Availability", "Reliability", "Resilience",
    "Fault Tolerance", "Disaster Recovery", "Business Continuity", "Backup", "Restore",
    "Migration", "Modernization", "Legacy Code", "Technical Strategy", "Technical Leadership",
    "Software Development Lifecycle", "SDLC", "Agile Methodology", "Scrum Framework",
    "Kanban Methodology", "Lean Software Development", "XP", "Extreme Programming",
    "Feature-Driven Development", "FDD", "Crystal Clear", "Dynamic Systems Development",
    "DSDM", "Adaptive Software Development", "ASD"
]

def get_custom_skills() -> list[str]:
    """Returns the complete list of custom skills."""
    return CUSTOM_SKILLS

def find_custom_skills_in_text(text: str) -> list[str]:
    """
    Find skills from the custom skills list that appear in the given text.
    Returns a list of matched skills.
    """
    found_skills = []
    text_lower = text.lower()
    for skill in CUSTOM_SKILLS:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    return found_skills
