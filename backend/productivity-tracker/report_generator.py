import os
import time
import pymongo
from window_tracker import WindowTracker
from ai_classifier import AIClassifier
from datetime import datetime, timedelta
import pyautogui
import pytesseract
from PIL import Image
import threading
import google.generativeai as genai
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import re
import os
from datetime import datetime, timedelta

class ReportGenerator:
    def __init__(self):
        # Define professional, neutral colors
        self.primary_color = colors.HexColor('#2C3E50')    # Dark blue-gray
        self.secondary_color = colors.HexColor('#7F8C8D')  # Medium gray
        self.accent_color = colors.HexColor('#34495E')     # Slate gray
        self.light_bg = colors.HexColor('#ECEFF1')        # Light gray-blue
        self.border_color = colors.HexColor('#CFD8DC')    # Light border gray
        self.virtutask_color = colors.HexColor('#0b4b59') # VirtuTask brand color
        
        # Initialize styles
        self.styles = getSampleStyleSheet()
        self._setup_styles()

    def _setup_styles(self):
        """Setup custom styles for the report"""
        style_names = ['CustomTitle', 'SectionHeader', 'CardTitle', 'ReportBody', 'SummaryContent']
        for name in style_names:
            if name in self.styles:
                del self.styles[name]
        
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=self.primary_color,
            leading=32,
            alignment=1
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceBefore=20,
            spaceAfter=10,
            textColor=self.accent_color,
            leading=20
        ))
        
        self.styles.add(ParagraphStyle(
            name='CardTitle',
            parent=self.styles['Heading3'],
            fontSize=12,
            textColor=self.primary_color,
            leading=16
        ))
        
        self.styles.add(ParagraphStyle(
            name='ReportBody',
            parent=self.styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=self.secondary_color
        ))
        
        self.styles.add(ParagraphStyle(
            name='SummaryContent',
            parent=self.styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=self.secondary_color,
            spaceBefore=6,
            spaceAfter=6
        ))

    def _create_header(self, canvas, doc):
        """Add header with logo and VirtuTask text to each page"""
        canvas.saveState()
        
        # Calculate positions
        page_width = doc.pagesize[0]
        margin = doc.rightMargin
        header_y = doc.pagesize[1] - margin - 0.1*inch
        
        # Add logo
        logo_path = "assets/logo.png"
        if os.path.exists(logo_path):
            logo_width = 0.5*inch
            logo_height = 0.5*inch
            logo_x = page_width - margin - 1.5*inch
            img = Image(logo_path, width=logo_width, height=logo_height)
            img.drawOn(canvas, logo_x, header_y)
            
            # Add VirtuTask text
            canvas.setFillColor(self.virtutask_color)
            canvas.setFont("Helvetica-Bold", 15)
            text_x = logo_x + logo_width + 0.05*inch
            text_y = header_y + 0.15*inch
            canvas.drawString(text_x, text_y, "VirtuTask")
        
        canvas.restoreState()

    def _parse_summary(self, summary_text):
        """
        Enhanced summary parsing with better section handling
        """
        if not summary_text or summary_text.strip() == "":
            return [
                [Paragraph("No summary available", self.styles['CardTitle']),
                 Paragraph("Session data could not be analyzed.", self.styles['ReportBody'])]
            ]

        # Clean the summary text
        clean_text = summary_text.replace('**', '').strip()
        
        # Split the summary into sections
        sections = []
        current_section = ""
        current_title = "General Summary"
        
        # Common section markers
        markers = [
            "Main tasks and activities:",
            "Tools and applications used:",
            "Key accomplishments:"
        ]
        
        # Process the text line by line
        lines = clean_text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check if this line is a section marker
            is_marker = False
            for marker in markers:
                if line.lower().startswith(marker.lower()):
                    # If we have content from previous section, add it
                    if current_section:
                        sections.append([
                            Paragraph(current_title, self.styles['CardTitle']),
                            Paragraph(current_section.strip(), self.styles['SummaryContent'])
                        ])
                    # Start new section
                    current_title = marker.rstrip(':')
                    current_section = line[len(marker):].strip()
                    is_marker = True
                    break
            
            if not is_marker:
                current_section += " " + line
        
        # Add the last section
        if current_section:
            sections.append([
                Paragraph(current_title, self.styles['CardTitle']),
                Paragraph(current_section.strip(), self.styles['SummaryContent'])
            ])
        
        # If no sections were found, use the entire text as one section
        if not sections:
            sections = [[
                Paragraph("Session Summary", self.styles['CardTitle']),
                Paragraph(clean_text, self.styles['SummaryContent'])
            ]]
        
        return sections

    def generate_report_to_buffer(self, session_data, summary, buffer):
        """Generate a PDF report and write it to a buffer"""
        try:
            doc = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=48,
                leftMargin=48,
                topMargin=48,
                bottomMargin=48
            )
            
            story = []
            
            # Title
            story.append(Paragraph("Work Session Report", self.styles['CustomTitle']))
            
            # Session Information Card
            session_info = [
                ['Session Name:', session_data['name']],
                ['Start Time:', session_data['start_time'].strftime('%Y-%m-%d %H:%M')],
                ['End Time:', session_data['end_time'].strftime('%Y-%m-%d %H:%M')],
                ['Duration:', f"{(session_data['end_time'] - session_data['start_time']).total_seconds() // 3600:.0f}h {((session_data['end_time'] - session_data['start_time']).total_seconds() % 3600) // 60:.0f}m"]
            ]
            
            session_table = Table(session_info, colWidths=[2*inch, 4*inch])
            session_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), self.light_bg),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('TEXTCOLOR', (0, 0), (0, -1), self.secondary_color),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('TOPPADDING', (0, 0), (-1, -1), 12),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('LEFTPADDING', (0, 0), (-1, -1), 20),
                ('RIGHTPADDING', (0, 0), (-1, -1), 20),
                ('GRID', (0, 0), (-1, -1), 1, self.border_color),
                ('ROUNDEDCORNERS', [10, 10, 10, 10]),
            ]))
            story.append(session_table)
            story.append(Spacer(1, 20))
        
            # Productivity Overview
            story.append(Paragraph("Productivity Overview", self.styles['SectionHeader']))
            
            total_time = session_data['productive_time'] + session_data['unproductive_time']
            productivity_percentage = (session_data['productive_time'] / total_time * 100) if total_time > 0 else 0
            
            prod_data = [
                ['Productive Time:', f"{session_data['productive_time'] // 3600}h {(session_data['productive_time'] % 3600) // 60}m", f"{productivity_percentage:.1f}% Productive"],
                ['Unproductive Time:', f"{session_data['unproductive_time'] // 3600}h {(session_data['unproductive_time'] % 3600) // 60}m", f"{100 - productivity_percentage:.1f}% Unproductive"]
            ]
            
            prod_table = Table(prod_data, colWidths=[2*inch, 2*inch, 2*inch])
            prod_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), self.light_bg),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('TEXTCOLOR', (0, 0), (0, -1), self.secondary_color),
                ('TEXTCOLOR', (-1, 0), (-1, 0), self.accent_color),
                ('TEXTCOLOR', (-1, 1), (-1, 1), self.secondary_color),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
                ('TOPPADDING', (0, 0), (-1, -1), 12),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('LEFTPADDING', (0, 0), (-1, -1), 20),
                ('RIGHTPADDING', (0, 0), (-1, -1), 20),
                ('GRID', (0, 0), (-1, -1), 1, self.border_color),
            ]))
            story.append(prod_table)
            story.append(Spacer(1, 20))
            
            # Application Usage
            story.append(Paragraph("Application Usage", self.styles['SectionHeader']))
            
            sorted_apps = sorted( 
                session_data['window_details'].items(),
                key=lambda x: x[1]['active_time'],
                reverse=True
            )
            
            app_data = [['Application', 'Time Spent', 'Category']]
            for app, details in sorted_apps:
                hours = details['active_time'] // 3600
                minutes = (details['active_time'] % 3600) // 60
                app_data.append([
                    app,
                    f"{hours}h {minutes}m",
                    'Productive' if details['productive'] else 'Unproductive'
                ])
            
            app_table = Table(app_data, colWidths=[3.5*inch, 1.5*inch, 1*inch])
            app_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), self.primary_color),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('ALIGN', (2, 0), (2, -1), 'CENTER'),
                ('TOPPADDING', (0, 0), (-1, -1), 12),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('LEFTPADDING', (0, 0), (-1, -1), 20),
                ('RIGHTPADDING', (0, 0), (-1, -1), 20),
                ('GRID', (0, 0), (-1, -1), 1, self.border_color),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [self.light_bg, colors.white]),
                ('TEXTCOLOR', (2, 1), (2, -1), self.accent_color),
            ]))
            story.append(app_table)
            story.append(Spacer(1, 20))
            
            # AI Summary Section
            story.append(Paragraph("AI Analysis Summary", self.styles['SectionHeader']))
            story.append(Spacer(1, 10))
            
            # Parse and format the summary
            summary_sections = self._parse_summary(summary)
            
            # Create a table for each summary section
            for section in summary_sections:
                section_table = Table([section], colWidths=[2*inch, 4*inch])
                section_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), self.light_bg),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('TOPPADDING', (0, 0), (-1, -1), 12),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                    ('LEFTPADDING', (0, 0), (-1, -1), 20),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 20),
                    ('GRID', (0, 0), (-1, -1), 1, self.border_color),
                ]))
                story.append(section_table)
                story.append(Spacer(1, 10))
            
         # Build the PDF to the buffer
            doc.build(story, onFirstPage=self._create_header, onLaterPages=self._create_header)
            
            # Reset buffer position for reading
            buffer.seek(0)
            
        except Exception as e:
            # Clear the buffer in case of error
            buffer.seek(0)
            buffer.truncate(0)
            
            print(f"Error generating report: {str(e)}")
            raise Exception(f"Failed to generate report: {str(e)}")