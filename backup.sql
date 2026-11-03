--
-- PostgreSQL database dump
--

\restrict b9ghII1IOfpj6WFA3DMC7agU7OEcueJK7tbu4elxbTT3CSV4N1nLh1IOCS8HD7b

-- Dumped from database version 18.6 (4e5fd08)
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: InputType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."InputType" AS ENUM (
    'CHECKLIST',
    'NUMBER',
    'TEXT',
    'RADIO'
);


ALTER TYPE public."InputType" OWNER TO neondb_owner;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'GURU',
    'SISWA',
    'KEPALA_SEKOLAH',
    'ADMIN_SEKOLAH'
);


ALTER TYPE public."Role" OWNER TO neondb_owner;

--
-- Name: Term; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Term" AS ENUM (
    'GANJIL',
    'GENAP'
);


ALTER TYPE public."Term" OWNER TO neondb_owner;

--
-- Name: VerificationStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."VerificationStatus" AS ENUM (
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE public."VerificationStatus" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Branch; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Branch" (
    id integer NOT NULL,
    name text NOT NULL,
    address text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Branch" OWNER TO neondb_owner;

--
-- Name: Branch_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public."Branch_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Branch_id_seq" OWNER TO neondb_owner;

--
-- Name: Branch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public."Branch_id_seq" OWNED BY public."Branch".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Name: amaliah_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.amaliah_items (
    id integer NOT NULL,
    name text NOT NULL,
    category text,
    "inputType" public."InputType" DEFAULT 'CHECKLIST'::public."InputType" NOT NULL,
    unit text,
    "isRamadhan" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "branchId" integer,
    options jsonb
);


ALTER TABLE public.amaliah_items OWNER TO neondb_owner;

--
-- Name: amaliah_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.amaliah_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.amaliah_items_id_seq OWNER TO neondb_owner;

--
-- Name: amaliah_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.amaliah_items_id_seq OWNED BY public.amaliah_items.id;


--
-- Name: classes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.classes (
    id integer NOT NULL,
    name text NOT NULL,
    "gradeLevel" integer,
    "homeroomTeacherId" integer,
    "branchId" integer NOT NULL
);


ALTER TABLE public.classes OWNER TO neondb_owner;

--
-- Name: classes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.classes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.classes_id_seq OWNER TO neondb_owner;

--
-- Name: classes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.classes_id_seq OWNED BY public.classes.id;


--
-- Name: daily_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.daily_entries (
    id integer NOT NULL,
    "studentId" integer NOT NULL,
    "semesterId" integer NOT NULL,
    date date NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    score integer
);


ALTER TABLE public.daily_entries OWNER TO neondb_owner;

--
-- Name: daily_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.daily_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_entries_id_seq OWNER TO neondb_owner;

--
-- Name: daily_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.daily_entries_id_seq OWNED BY public.daily_entries.id;


--
-- Name: entry_details; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.entry_details (
    id integer NOT NULL,
    "entryId" integer NOT NULL,
    "itemId" integer NOT NULL,
    "boolValue" boolean,
    "numberValue" double precision,
    "textValue" text
);


ALTER TABLE public.entry_details OWNER TO neondb_owner;

--
-- Name: entry_details_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.entry_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.entry_details_id_seq OWNER TO neondb_owner;

--
-- Name: entry_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.entry_details_id_seq OWNED BY public.entry_details.id;


--
-- Name: ramadhan_periods; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ramadhan_periods (
    id integer NOT NULL,
    "hijriYear" integer NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL
);


ALTER TABLE public.ramadhan_periods OWNER TO neondb_owner;

--
-- Name: ramadhan_periods_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.ramadhan_periods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ramadhan_periods_id_seq OWNER TO neondb_owner;

--
-- Name: ramadhan_periods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.ramadhan_periods_id_seq OWNED BY public.ramadhan_periods.id;


--
-- Name: semesters; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.semesters (
    id integer NOT NULL,
    "academicYear" text NOT NULL,
    term public."Term" NOT NULL,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "branchId" integer NOT NULL
);


ALTER TABLE public.semesters OWNER TO neondb_owner;

--
-- Name: semesters_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.semesters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.semesters_id_seq OWNER TO neondb_owner;

--
-- Name: semesters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.semesters_id_seq OWNED BY public.semesters.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.students (
    id integer NOT NULL,
    "userId" text,
    nis text NOT NULL,
    "classId" integer,
    name text NOT NULL,
    "branchId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.students OWNER TO neondb_owner;

--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_id_seq OWNER TO neondb_owner;

--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: teachers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.teachers (
    id integer NOT NULL,
    "userId" text NOT NULL,
    nip text
);


ALTER TABLE public.teachers OWNER TO neondb_owner;

--
-- Name: teachers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.teachers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teachers_id_seq OWNER TO neondb_owner;

--
-- Name: teachers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.teachers_id_seq OWNED BY public.teachers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    username text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "branchId" integer
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: verifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.verifications (
    id integer NOT NULL,
    "entryId" integer NOT NULL,
    "teacherId" integer NOT NULL,
    status public."VerificationStatus" NOT NULL,
    note text,
    "verifiedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.verifications OWNER TO neondb_owner;

--
-- Name: verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.verifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.verifications_id_seq OWNER TO neondb_owner;

--
-- Name: verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.verifications_id_seq OWNED BY public.verifications.id;


--
-- Name: Branch id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Branch" ALTER COLUMN id SET DEFAULT nextval('public."Branch_id_seq"'::regclass);


--
-- Name: amaliah_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.amaliah_items ALTER COLUMN id SET DEFAULT nextval('public.amaliah_items_id_seq'::regclass);


--
-- Name: classes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.classes ALTER COLUMN id SET DEFAULT nextval('public.classes_id_seq'::regclass);


--
-- Name: daily_entries id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_entries ALTER COLUMN id SET DEFAULT nextval('public.daily_entries_id_seq'::regclass);


--
-- Name: entry_details id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.entry_details ALTER COLUMN id SET DEFAULT nextval('public.entry_details_id_seq'::regclass);


--
-- Name: ramadhan_periods id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ramadhan_periods ALTER COLUMN id SET DEFAULT nextval('public.ramadhan_periods_id_seq'::regclass);


--
-- Name: semesters id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.semesters ALTER COLUMN id SET DEFAULT nextval('public.semesters_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: teachers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teachers ALTER COLUMN id SET DEFAULT nextval('public.teachers_id_seq'::regclass);


--
-- Name: verifications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.verifications ALTER COLUMN id SET DEFAULT nextval('public.verifications_id_seq'::regclass);


--
-- Data for Name: Branch; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Branch" (id, name, address, "isActive", "createdAt") FROM stdin;
3	CIS Primary Gresik	Puri Safira Regency	t	2026-10-30 06:23:18.638
4	CIS Primary Sidoarjo	Safira Juanda Resort	t	2026-10-30 06:23:50.888
5	CIS Primary malang	de Cassablanca Residence	t	2026-10-30 06:24:16.489
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
5027294c-aa3d-4492-ad10-47442d6667c4	a364537301dde46ce74ff8b3adca5e9ae58a4bfe5e1320326eb09261d1597ca0	2026-10-30 14:48:03.917949+00	20261030200000_backfill_teacher_profiles	\N	\N	2026-10-30 14:48:01.87722+00	1
1ca0a430-d3af-4990-81fb-3eb8737273a7	e43dc9b69998f12ba67272dea0ce911fc9144e769836eb05a9f53db0fb2a66fa	2026-10-28 14:08:25.458271+00	20261026034145_init	\N	\N	2026-10-28 14:08:23.433911+00	1
f7f21e2e-6099-46d8-9b19-9be20afbc891	fc29ed9d324e5b3ddf2441469aeba5dad8549cb95259507f5c571765814e5142	2026-10-28 14:08:28.31094+00	20261027004412_add_all_models	\N	\N	2026-10-28 14:08:26.277423+00	1
714da9af-7f9c-4ee3-98fe-2e846e5a0f06	37ecf0760641b4b9ed4b2b5998a4f31bdc70b256fd33a224409c00d1198ac1e4	2026-10-28 14:08:31.192488+00	20261027131149_tambah_cabang	\N	\N	2026-10-28 14:08:29.144623+00	1
0009b52f-4bce-45d8-90fb-f3d7d5e0d731	5a9155ba70fdf2074d50ab74b0deda5ed23f4bcaa06eede929c569d8b6b2a904	2026-10-28 14:08:34.05943+00	20261027150805_perbaiki_unik_semester_dan_kelas	\N	\N	2026-10-28 14:08:31.985661+00	1
2c3db718-7adc-490b-8055-63f8698a06f1	33e6b08b894b409df2be91be9ae3f74bd8d430c3f9f06c43013045fe4612b324	2026-10-28 14:08:36.927139+00	20261028020253_skor_otomatis	\N	\N	2026-10-28 14:08:34.879159+00	1
675f0695-e253-4201-9bb0-96e19d556331	b04b6b249f612f8d56dc77110bb9d1133a732247e13b4745ed93e36bb2fc891b	2026-10-30 07:14:01.257195+00	20261030150000_add_radio_item_type	\N	\N	2026-10-30 07:13:59.786383+00	1
5b1e3b05-f976-4454-8372-082938751324	061e39a6e6ad39893621afe1e448e42a775397456ef9afe8add6b6d72b164092	\N	20261030170000_make_students_independent	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20261030170000_make_students_independent\n\nDatabase error code: 42P01\n\nDatabase error:\nERROR: relation "branches" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relation \\"branches\\" does not exist", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("namespace.c"), line: Some(637), routine: Some("RangeVarGetRelidExtended") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20261030170000_make_students_independent"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20261030170000_make_students_independent"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:260	2026-10-30 13:48:19.409867+00	2026-10-30 13:47:28.290423+00	0
ae5a304c-e029-488c-a473-ee2ed85cd053	3a8202cb5c1fed116705090308dafb9a21ab3a8c0ee57386c7d93b1b2a4f1b29	2026-10-30 13:48:36.979356+00	20261030170000_make_students_independent	\N	\N	2026-10-30 13:48:34.932184+00	1
\.


--
-- Data for Name: amaliah_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.amaliah_items (id, name, category, "inputType", unit, "isRamadhan", "isActive", "sortOrder", "branchId", options) FROM stdin;
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.classes (id, name, "gradeLevel", "homeroomTeacherId", "branchId") FROM stdin;
4	1B	1	\N	3
5	2A	2	\N	3
6	2B	2	\N	3
8	4	4	\N	3
9	5	5	\N	3
10	6	6	\N	3
3	1A	1	\N	3
7	3	3	4	3
\.


--
-- Data for Name: daily_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.daily_entries (id, "studentId", "semesterId", date, notes, "createdAt", "updatedAt", score) FROM stdin;
\.


--
-- Data for Name: entry_details; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.entry_details (id, "entryId", "itemId", "boolValue", "numberValue", "textValue") FROM stdin;
\.


--
-- Data for Name: ramadhan_periods; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ramadhan_periods (id, "hijriYear", "startDate", "endDate") FROM stdin;
1	1448	2027-02-08	2027-03-09
\.


--
-- Data for Name: semesters; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.semesters (id, "academicYear", term, "startDate", "endDate", "isActive", "branchId") FROM stdin;
5	2026/2027	GENAP	2027-01-11	2027-06-11	f	3
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.students (id, "userId", nis, "classId", name, "branchId", "isActive") FROM stdin;
6	\N	03798173917	7	Arya Dhiva Handy	3	t
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.teachers (id, "userId", nip) FROM stdin;
4	5fb07d71-12bb-448b-bc77-b01f358b4a88	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, name, username, "passwordHash", role, "isActive", "createdAt", "updatedAt", "branchId") FROM stdin;
d442935a-1bad-440b-b3ba-c600b44eaec7	Arya Dhiva Handy	aryadhiva14	$2b$10$8NNPOzrR6bo5bBj74ftr8uG4ZNQ2Q2YO200czjgIyucvKeV2gbA6G	ADMIN	t	2026-10-28 14:22:57.839	2026-10-30 06:40:11.167	\N
4bf4bc3a-793c-46fa-8263-71a42eb32b73	Gusti Pramugara	gusti1234	$2b$10$xVaujSnbZ8i1cJ5kTHTXQuBU9mhf2gZzSoBOy8LDiJ3sEReqf72LW	ADMIN_SEKOLAH	t	2026-10-30 14:12:46.119	2026-10-30 14:12:46.119	3
5fb07d71-12bb-448b-bc77-b01f358b4a88	Ms. Keke	cis_keke	$2b$10$H.bFxWkME9heIcoEVxbHFOjOturQB56vX/VTc7D3.b621cYSdBhYm	GURU	t	2026-10-30 14:33:04.218	2026-11-03 00:40:23.031	3
\.


--
-- Data for Name: verifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.verifications (id, "entryId", "teacherId", status, note, "verifiedAt") FROM stdin;
\.


--
-- Name: Branch_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public."Branch_id_seq"', 5, true);


--
-- Name: amaliah_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.amaliah_items_id_seq', 36, true);


--
-- Name: classes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.classes_id_seq', 10, true);


--
-- Name: daily_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.daily_entries_id_seq', 14, true);


--
-- Name: entry_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.entry_details_id_seq', 112, true);


--
-- Name: ramadhan_periods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.ramadhan_periods_id_seq', 1, true);


--
-- Name: semesters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.semesters_id_seq', 5, true);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.students_id_seq', 6, true);


--
-- Name: teachers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.teachers_id_seq', 4, true);


--
-- Name: verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.verifications_id_seq', 1, false);


--
-- Name: Branch Branch_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Branch"
    ADD CONSTRAINT "Branch_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: amaliah_items amaliah_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.amaliah_items
    ADD CONSTRAINT amaliah_items_pkey PRIMARY KEY (id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: daily_entries daily_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_entries
    ADD CONSTRAINT daily_entries_pkey PRIMARY KEY (id);


--
-- Name: entry_details entry_details_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.entry_details
    ADD CONSTRAINT entry_details_pkey PRIMARY KEY (id);


--
-- Name: ramadhan_periods ramadhan_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ramadhan_periods
    ADD CONSTRAINT ramadhan_periods_pkey PRIMARY KEY (id);


--
-- Name: semesters semesters_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT semesters_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verifications verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT verifications_pkey PRIMARY KEY (id);


--
-- Name: amaliah_items_branchId_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "amaliah_items_branchId_name_key" ON public.amaliah_items USING btree ("branchId", name);


--
-- Name: daily_entries_semesterId_studentId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "daily_entries_semesterId_studentId_idx" ON public.daily_entries USING btree ("semesterId", "studentId");


--
-- Name: daily_entries_studentId_date_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "daily_entries_studentId_date_key" ON public.daily_entries USING btree ("studentId", date);


--
-- Name: entry_details_entryId_itemId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "entry_details_entryId_itemId_key" ON public.entry_details USING btree ("entryId", "itemId");


--
-- Name: ramadhan_periods_hijriYear_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "ramadhan_periods_hijriYear_key" ON public.ramadhan_periods USING btree ("hijriYear");


--
-- Name: semesters_branchId_academicYear_term_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "semesters_branchId_academicYear_term_key" ON public.semesters USING btree ("branchId", "academicYear", term);


--
-- Name: students_nis_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX students_nis_key ON public.students USING btree (nis);


--
-- Name: students_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "students_userId_key" ON public.students USING btree ("userId");


--
-- Name: teachers_nip_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX teachers_nip_key ON public.teachers USING btree (nip);


--
-- Name: teachers_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "teachers_userId_key" ON public.teachers USING btree ("userId");


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: verifications_entryId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "verifications_entryId_key" ON public.verifications USING btree ("entryId");


--
-- Name: amaliah_items amaliah_items_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.amaliah_items
    ADD CONSTRAINT "amaliah_items_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: classes classes_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT "classes_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: classes classes_homeroomTeacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT "classes_homeroomTeacherId_fkey" FOREIGN KEY ("homeroomTeacherId") REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: daily_entries daily_entries_semesterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_entries
    ADD CONSTRAINT "daily_entries_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES public.semesters(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: daily_entries daily_entries_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_entries
    ADD CONSTRAINT "daily_entries_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: entry_details entry_details_entryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.entry_details
    ADD CONSTRAINT "entry_details_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES public.daily_entries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: entry_details entry_details_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.entry_details
    ADD CONSTRAINT "entry_details_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public.amaliah_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: semesters semesters_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT "semesters_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: students students_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "students_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: students students_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "students_classId_fkey" FOREIGN KEY ("classId") REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: students students_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: teachers teachers_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT "teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_branchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: verifications verifications_entryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT "verifications_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES public.daily_entries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: verifications verifications_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT "verifications_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT SELECT,INSERT,DELETE,TRUNCATE,MAINTAIN,UPDATE ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict b9ghII1IOfpj6WFA3DMC7agU7OEcueJK7tbu4elxbTT3CSV4N1nLh1IOCS8HD7b

