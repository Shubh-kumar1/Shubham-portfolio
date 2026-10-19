from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "Shubham_Kumar_Resume.pdf"

INK = colors.HexColor("#1B1C20")
MUTED = colors.HexColor("#61636A")
ACCENT = colors.HexColor("#D6573C")
PAPER = colors.HexColor("#F7F4EF")
LINE = colors.HexColor("#DDD8D0")


def paragraph(text, style):
    return Paragraph(text, style)


def section(title, body, styles):
    return [
        Spacer(1, 3.5 * mm),
        paragraph(title.upper(), styles["section"]),
        Spacer(1, 1.4 * mm),
        HRFlowable(width="100%", thickness=0.5, color=LINE, spaceAfter=2.5 * mm),
        *body,
    ]


def project(title, subtitle, description, stack, styles, link=None):
    heading = f"<b>{title}</b> <font color='#61636A'>{subtitle}</font>"
    lines = [paragraph(heading, styles["item"]), paragraph(description, styles["body"])]
    meta = f"<font color='#D6573C'>TECH</font> &nbsp; {stack}"
    if link:
        meta += f" &nbsp;&nbsp; <font color='#D6573C'>LIVE</font> &nbsp; {link}"
    lines.append(paragraph(meta, styles["meta"]))
    return KeepTogether(lines + [Spacer(1, 2.1 * mm)])


def experience(title, dates, description, stack, styles):
    return KeepTogether([
        paragraph(f"<b>{title}</b> <font color='#61636A'>{dates}</font>", styles["item"]),
        paragraph(description, styles["body"]),
        paragraph(f"<font color='#D6573C'>TOOLS</font> &nbsp; {stack}", styles["meta"]),
        Spacer(1, 2.1 * mm),
    ])


def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(doc.leftMargin, 12 * mm, A4[0] - doc.rightMargin, 12 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(doc.leftMargin, 7.7 * mm, "SHUBHAM KUMAR  |  BACKEND ENGINEER")
    canvas.drawRightString(A4[0] - doc.rightMargin, 7.7 * mm, f"PAGE {doc.page}")
    canvas.restoreState()


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm,
        topMargin=15 * mm, bottomMargin=20 * mm,
    )
    base = getSampleStyleSheet()
    styles = {
        "name": ParagraphStyle("name", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=27, leading=29, textColor=INK, spaceAfter=1.3 * mm),
        "role": ParagraphStyle("role", parent=base["Normal"], fontName="Helvetica", fontSize=9.6, leading=13, textColor=MUTED),
        "contact": ParagraphStyle("contact", parent=base["Normal"], fontName="Helvetica", fontSize=8.2, leading=12, textColor=MUTED, alignment=TA_LEFT),
        "section": ParagraphStyle("section", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=8.4, leading=10, tracking=1.6, textColor=ACCENT),
        "body": ParagraphStyle("body", parent=base["Normal"], fontName="Helvetica", fontSize=8.6, leading=12.2, textColor=INK, spaceAfter=1.0 * mm),
        "item": ParagraphStyle("item", parent=base["Normal"], fontName="Helvetica", fontSize=9.4, leading=12.4, textColor=INK, spaceAfter=.45 * mm),
        "meta": ParagraphStyle("meta", parent=base["Normal"], fontName="Helvetica", fontSize=7.4, leading=10, textColor=MUTED, spaceAfter=.6 * mm),
        "skill": ParagraphStyle("skill", parent=base["Normal"], fontName="Helvetica", fontSize=8.4, leading=12, textColor=INK),
    }

    story = []
    header_left = [paragraph("Shubham Kumar", styles["name"]), paragraph("BACKEND ENGINEER", styles["role"])]
    header_right = [paragraph("shubhamraj9493@gmail.com<br/>linkedin.com/in/shubham-kumar-87bb8b357/<br/>github.com/Shubh-kumar1<br/>leetcode.com/u/Shubh_kumar01/", styles["contact"])]
    header = Table([[header_left, header_right]], colWidths=[105 * mm, 68 * mm])
    header.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0), ("BACKGROUND", (0, 0), (-1, -1), PAPER)]))
    story += [header, Spacer(1, 3.3 * mm), HRFlowable(width="100%", thickness=1.2, color=INK, spaceAfter=1.5 * mm)]

    story += section("Profile", [paragraph("Backend engineer focused on designing dependable Java and Python systems. I enjoy turning complex ideas into clear APIs, scalable data flows, and thoughtful products with strong foundations in DSA, OOP, DBMS, and system design.", styles["body"])], styles)

    story += section("Selected projects", [
        project("Cricket Connect", "| Full-stack sports platform", "Built a platform connecting cricket enthusiasts, local teams, and academies through player registration, match discovery, bookings, and coach approval workflows.", "Java, FastAPI, Redis, full-stack development", styles, "cricket-connect-fastapi.vercel.app"),
        project("Blue Signal", "| AI hazard intelligence", "Led backend development for an AI-powered flood response and hazard-monitoring system, designing a scalable pipeline for real-time multimodal environmental data.", "Python, AI/ML, Docker, system architecture", styles, "blue-signal.vercel.app"),
        project("Earthquake Mapping", "| Live data visualization", "Created an interactive geographical mapping tool that processes live USGS RSS feeds for real-time seismic data parsing and visualization.", "Java, OOP, live feeds, data parsing", styles),
    ], styles)

    story += section("Experience", [
        experience("AI-ML Virtual Intern", "| Jan 2025 - Mar 2025", "Explored predictive analysis with TensorFlow and Python, working with real-world datasets and model optimization.", "TensorFlow, Python, machine learning", styles),
        experience("AWS Cloud Intern", "| Jan 2026 - Mar 2026", "Worked with EC2, S3, and RDS while architecting secure cloud solutions and learning IAM, reliability, and cost optimization.", "EC2, S3, RDS, IAM", styles),
    ], styles)

    story += section("Technical skills", [
        paragraph("<b>Languages:</b> Java, Python, SQL, JavaScript &nbsp;&nbsp; <b>Backend:</b> FastAPI, Flask, WebSockets, REST APIs", styles["skill"]),
        Spacer(1, 1.0 * mm),
        paragraph("<b>Data & infrastructure:</b> PostgreSQL, Redis, Docker, AWS &nbsp;&nbsp; <b>Foundations:</b> DSA, OOP, System Design, DBMS", styles["skill"]),
    ], styles)

    story += section("Education & certifications", [
        paragraph("<b>B.Tech in Computer Science (AI & ML)</b> &nbsp; | &nbsp; G. L. Bajaj Institute of Technology and Management &nbsp; | &nbsp; 2023 - 2027 &nbsp; | &nbsp; CGPA: 7.6 / 10.0", styles["body"]),
        paragraph("Introduction to Cybersecurity (Cisco Networking Academy) · Learn Coding with Java from Scratch (Udemy) · Git, GitLab, GitHub Fundamentals (Udemy) · Introduction to MongoDB (MongoDB University) · Object Oriented Programming in Java (Coursera, UC San Diego)", styles["meta"]),
    ], styles)

    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)


if __name__ == "__main__":
    build()
