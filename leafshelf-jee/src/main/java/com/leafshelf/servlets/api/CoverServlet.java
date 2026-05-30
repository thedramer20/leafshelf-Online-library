package com.leafshelf.servlets.api;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;

@WebServlet("/api/covers")
public class CoverServlet extends HttpServlet {

    private record BookDesign(String dark, String mid, String accent, String text, String artwork) {}

    private static final Map<String, BookDesign> BOOK_DESIGNS = new HashMap<>();

    static {
        // ── Dystopian ─────────────────────────────────────────────────────────
        BOOK_DESIGNS.put("1984", new BookDesign("#070711","#0d1117","#dc2626","#fca5a5",
            // Giant white all-seeing eye — high contrast
            "<ellipse cx='100' cy='130' rx='56' ry='36' fill='none' stroke='white' stroke-width='3.5' opacity='.9'/>" +
            "<circle cx='100' cy='130' r='22' fill='#dc2626'/>" +
            "<circle cx='100' cy='130' r='11' fill='#0d1117'/>" +
            "<circle cx='107' cy='124' r='5' fill='white' opacity='.9'/>" +
            "<line x1='40' y1='130' x2='160' y2='130' stroke='white' stroke-width='.8' stroke-dasharray='3,5' opacity='.3'/>" +
            "<line x1='100' y1='88' x2='100' y2='172' stroke='white' stroke-width='.8' stroke-dasharray='3,5' opacity='.3'/>"
        ));

        BOOK_DESIGNS.put("brave new world", new BookDesign("#0d1117","#1e293b","#0ea5e9","#bae6fd",
            // 5 identical white uniform figures
            "<circle cx='50'  cy='110' r='9' fill='white' opacity='.85'/>" +
            "<circle cx='75'  cy='110' r='9' fill='white' opacity='.85'/>" +
            "<circle cx='100' cy='110' r='9' fill='white' opacity='.85'/>" +
            "<circle cx='125' cy='110' r='9' fill='white' opacity='.85'/>" +
            "<circle cx='150' cy='110' r='9' fill='white' opacity='.85'/>" +
            "<rect x='43'  y='119' width='14' height='32' rx='2' fill='white' opacity='.8'/>" +
            "<rect x='68'  y='119' width='14' height='32' rx='2' fill='white' opacity='.8'/>" +
            "<rect x='93'  y='119' width='14' height='32' rx='2' fill='white' opacity='.8'/>" +
            "<rect x='118' y='119' width='14' height='32' rx='2' fill='white' opacity='.8'/>" +
            "<rect x='143' y='119' width='14' height='32' rx='2' fill='white' opacity='.8'/>" +
            "<rect x='28' y='158' width='144' height='2' fill='#38bdf8' opacity='.6'/>"
        ));

        BOOK_DESIGNS.put("fahrenheit 451", new BookDesign("#0f0500","#1a0a00","#ea580c","#fed7aa",
            // Large bright flame
            "<path d='M68,168 Q64,138 76,120 Q70,142 82,138 Q76,114 90,100 Q84,124 96,118 Q92,92 108,78 Q100,106 112,100 Q110,74 124,66 Q114,94 120,112 Q130,90 134,114 Q130,130 132,168 Z' fill='#ea580c' opacity='.95'/>" +
            "<path d='M80,168 Q78,142 87,126 Q83,144 91,140 Q87,118 97,106 Q93,130 101,126 Q101,102 113,94 Q105,118 113,168 Z' fill='#fde68a' opacity='.9'/>" +
            "<path d='M90,168 Q90,150 95,142 Q93,154 99,152 Q98,138 106,168 Z' fill='white' opacity='.75'/>"
        ));

        // ── Fantasy ───────────────────────────────────────────────────────────
        BOOK_DESIGNS.put("the hobbit", new BookDesign("#0a1a0a","#1a3a10","#84cc16","#d9f99d",
            // Round bright green hobbit door on hillside
            "<ellipse cx='100' cy='178' rx='82' ry='28' fill='#2d5a1a' opacity='.7'/>" +
            "<circle cx='100' cy='148' r='40' fill='#3d6b1a' stroke='#6ab030' stroke-width='4'/>" +
            "<circle cx='100' cy='148' r='33' fill='#1a3a0a' stroke='#4a8a25' stroke-width='2'/>" +
            "<rect x='82' y='124' width='36' height='48' rx='2' fill='#4a2a0a'/>" +
            "<line x1='100' y1='124' x2='100' y2='172' stroke='#2a1505' stroke-width='2.5'/>" +
            "<circle cx='112' cy='148' r='5' fill='#d4af37' stroke='#b8860b' stroke-width='1.5'/>" +
            "<ellipse cx='100' cy='148' rx='26' ry='32' fill='rgba(255,200,50,.07)'/>" +
            "<polygon points='20,178 55,122 90,178'  fill='#2d5a1a' opacity='.55'/>" +
            "<polygon points='110,178 155,118 200,178' fill='#2d5a1a' opacity='.55'/>"
        ));

        BOOK_DESIGNS.put("harry potter and the philosopher's stone", new BookDesign("#0a0520","#1a0a40","#f5c518","#fef3c7",
            // White castle + large gold lightning bolt
            "<polygon points='38,172 38,122 54,122 54,106 64,106 64,90 74,90 74,80 85,80 85,90 95,86 95,122 105,122 105,86 116,80 116,90 126,90 126,106 136,106 136,122 152,122 152,118 162,118 162,172' fill='white' opacity='.22'/>" +
            "<circle cx='28' cy='90' r='2.5' fill='white' opacity='.8'/>" +
            "<circle cx='172' cy='80' r='2.5' fill='white' opacity='.8'/>" +
            "<circle cx='42' cy='70' r='2' fill='white' opacity='.6'/>" +
            "<circle cx='158' cy='95' r='2' fill='white' opacity='.6'/>" +
            "<polygon points='100,66 89,99 100,99 88,134 116,94 103,94 115,66' fill='#f5c518'/>" +
            "<polygon points='100,66 89,99 100,99 88,134 116,94 103,94 115,66' fill='#fffde7' opacity='.25' transform='scale(1.08,1.08) translate(-8,-7)'/>"
        ));

        BOOK_DESIGNS.put("the lord of the rings", new BookDesign("#0a0800","#1a1000","#b8860b","#fde68a",
            // Large bright gold ring
            "<circle cx='100' cy='130' r='50' fill='none' stroke='#d4af37' stroke-width='8' opacity='.95'/>" +
            "<circle cx='100' cy='130' r='42' fill='none' stroke='rgba(255,215,0,.2)' stroke-width='3'/>" +
            "<circle cx='100' cy='130' r='56' fill='none' stroke='rgba(184,134,11,.15)' stroke-width='2'/>" +
            "<text x='100' y='113' text-anchor='middle' font-size='7' fill='#ffd700' opacity='.95' font-family='serif' letter-spacing='2'>One Ring</text>" +
            "<text x='100' y='152' text-anchor='middle' font-size='7' fill='#ffd700' opacity='.95' font-family='serif' letter-spacing='1'>to rule them all</text>"
        ));

        // ── Classic ───────────────────────────────────────────────────────────
        BOOK_DESIGNS.put("to kill a mockingbird", new BookDesign("#1a1005","#3d2a10","#f59e0b","#fef3c7",
            // White mockingbird on dark branch
            "<line x1='22' y1='180' x2='186' y2='100' stroke='#5a3a10' stroke-width='6' stroke-linecap='round'/>" +
            "<line x1='100' y1='142' x2='70' y2='166' stroke='#5a3a10' stroke-width='3.5' stroke-linecap='round'/>" +
            "<line x1='100' y1='142' x2='134' y2='160' stroke='#5a3a10' stroke-width='3.5' stroke-linecap='round'/>" +
            "<ellipse cx='117' cy='122' rx='17' ry='11' fill='white' opacity='.95' transform='rotate(-18,117,122)'/>" +
            "<ellipse cx='131' cy='112' rx='11' ry='8' fill='white' opacity='.95' transform='rotate(-18,131,112)'/>" +
            "<path d='M112,118 Q93,110 91,127 Q106,124 112,118Z' fill='#ddd5c5' opacity='.9'/>" +
            "<line x1='138' y1='110' x2='148' y2='106' stroke='#5a4a2a' stroke-width='2.5'/>" +
            "<circle cx='135' cy='111' r='3' fill='#1a1a1a'/>" +
            "<circle cx='136' cy='110' r='1' fill='white'/>" +
            "<path d='M100,132 Q88,143 82,155' fill='none' stroke='white' stroke-width='3' opacity='.8'/>" +
            "<path d='M100,132 Q92,147 92,160' fill='none' stroke='white' stroke-width='3' opacity='.8'/>"
        ));

        BOOK_DESIGNS.put("the great gatsby", new BookDesign("#020e1e","#0a2a4a","#d4af37","#fef3c7",
            // Large bright gold billboard eyes
            "<ellipse cx='66' cy='110' rx='24' ry='15' fill='none' stroke='#ffd700' stroke-width='3.5'/>" +
            "<ellipse cx='134' cy='110' rx='24' ry='15' fill='none' stroke='#ffd700' stroke-width='3.5'/>" +
            "<ellipse cx='66' cy='110' rx='13' ry='13' fill='#ffd700' opacity='.95'/>" +
            "<ellipse cx='134' cy='110' rx='13' ry='13' fill='#ffd700' opacity='.95'/>" +
            "<circle cx='66' cy='110' r='6' fill='#020e1e'/>" +
            "<circle cx='134' cy='110' r='6' fill='#020e1e'/>" +
            "<circle cx='69' cy='107' r='2.5' fill='white' opacity='.85'/>" +
            "<circle cx='137' cy='107' r='2.5' fill='white' opacity='.85'/>" +
            "<rect x='0' y='158' width='200' height='42' fill='#020e1e' opacity='.8'/>" +
            "<ellipse cx='100' cy='165' rx='82' ry='6' fill='none' stroke='#0a4a8a' stroke-width='1.5' opacity='.4'/>" +
            "<circle cx='34' cy='150' r='3' fill='#ffd700' opacity='.8'/>" +
            "<circle cx='55' cy='144' r='2' fill='#ffd700' opacity='.6'/>" +
            "<circle cx='148' cy='148' r='3' fill='#ffd700' opacity='.8'/>" +
            "<circle cx='168' cy='142' r='2' fill='#ffd700' opacity='.6'/>" +
            "<circle cx='100' cy='144' r='3.5' fill='#ffd700' opacity='.7'/>"
        ));

        BOOK_DESIGNS.put("crime and punishment", new BookDesign("#080c14","#0f1a28","#64748b","#e2e8f0",
            // White bridge arch over dark canal
            "<path d='M0,158 Q50,112 100,108 Q150,112 200,158' fill='none' stroke='white' stroke-width='4' opacity='.85'/>" +
            "<path d='M18,158 Q62,124 100,120 Q138,124 182,158' fill='none' stroke='white' stroke-width='1.5' opacity='.4'/>" +
            "<rect x='32' y='114' width='11' height='44' fill='white' opacity='.22'/>" +
            "<rect x='157' y='114' width='11' height='44' fill='white' opacity='.22'/>" +
            "<circle cx='37' cy='112' r='6' fill='#ffd700' opacity='.95'/>" +
            "<circle cx='163' cy='112' r='6' fill='#ffd700' opacity='.95'/>" +
            "<line x1='37' y1='118' x2='37' y2='135' stroke='#ffd700' stroke-width='1.5' opacity='.4'/>" +
            "<line x1='163' y1='118' x2='163' y2='135' stroke='#ffd700' stroke-width='1.5' opacity='.4'/>" +
            "<rect x='0' y='158' width='200' height='42' fill='#0a1520' opacity='.9'/>" +
            "<ellipse cx='100' cy='165' rx='82' ry='5' fill='none' stroke='#1e3a5a' stroke-width='1' opacity='.4'/>"
        ));

        BOOK_DESIGNS.put("moby dick", new BookDesign("#030c18","#0a1e30","#0369a1","#bae6fd",
            // Large white whale breaching
            "<path d='M0,152 Q25,130 50,144 Q75,158 100,140 Q125,122 150,137 Q175,152 200,134 L200,200 L0,200 Z' fill='#0a2a4a' opacity='.9'/>" +
            "<path d='M38,140 Q50,88 88,78 Q132,68 154,98 Q167,117 162,140 Q142,124 120,130 Q94,142 72,132 Z' fill='white' opacity='.92'/>" +
            "<ellipse cx='140' cy='100' rx='15' ry='9' fill='#cce8f4' opacity='.7'/>" +
            "<path d='M38,140 Q26,122 12,114 Q24,107 36,118 Q28,110 16,102 Q28,98 42,114 Z' fill='white' opacity='.8'/>" +
            "<circle cx='137' cy='105' r='5' fill='#0a1e30'/>" +
            "<circle cx='138.5' cy='103.5' r='2' fill='white'/>" +
            "<rect x='88' y='72' width='24' height='3' fill='white' opacity='.5'/>" +
            "<polygon points='100,50 88,72 112,72' fill='white' opacity='.3'/>"
        ));

        BOOK_DESIGNS.put("the picture of dorian gray", new BookDesign("#14071e","#2d1045","#9333ea","#e9d5ff",
            // Bright purple ornate portrait frame
            "<rect x='38' y='74' width='124' height='136' rx='3' fill='none' stroke='#c084fc' stroke-width='3.5'/>" +
            "<rect x='46' y='82' width='108' height='120' rx='2' fill='none' stroke='#a855f7' stroke-width='1.5' opacity='.7'/>" +
            "<circle cx='38' cy='74' r='7' fill='#c084fc'/>" +
            "<circle cx='162' cy='74' r='7' fill='#c084fc'/>" +
            "<circle cx='38' cy='210' r='7' fill='#c084fc'/>" +
            "<circle cx='162' cy='210' r='7' fill='#c084fc'/>" +
            "<ellipse cx='100' cy='118' rx='23' ry='25' fill='#6b21a8' stroke='#c084fc' stroke-width='2'/>" +
            "<path d='M68,188 Q70,148 100,140 Q130,148 132,188 Z' fill='#6b21a8' stroke='#c084fc' stroke-width='2'/>" +
            "<circle cx='66' cy='202' r='7' fill='#c084fc'/>" +
            "<circle cx='100' cy='205' r='8' fill='#a855f7'/>" +
            "<circle cx='134' cy='202' r='7' fill='#c084fc'/>"
        ));

        BOOK_DESIGNS.put("anna karenina", new BookDesign("#14050a","#3d0a14","#dc2626","#fca5a5",
            // White onion-dome church in snow
            "<path d='M100,70 Q86,88 83,110 L117,110 Q114,88 100,70 Z' fill='white' opacity='.9'/>" +
            "<rect x='83' y='110' width='34' height='60' fill='white' opacity='.82'/>" +
            "<rect x='77' y='160' width='46' height='17' fill='white' opacity='.78'/>" +
            "<line x1='100' y1='54' x2='100' y2='68' stroke='#d4af37' stroke-width='4'/>" +
            "<line x1='91'  y1='59' x2='109' y2='59' stroke='#d4af37' stroke-width='4'/>" +
            "<line x1='94'  y1='65' x2='106' y2='65' stroke='#d4af37' stroke-width='2.5'/>" +
            "<rect x='90' y='120' width='10' height='14' rx='4' fill='rgba(255,180,60,.65)'/>" +
            "<rect x='100' y='120' width='10' height='14' rx='4' fill='rgba(255,180,60,.65)'/>" +
            "<circle cx='32' cy='90' r='3.5' fill='white' opacity='.85'/>" +
            "<circle cx='168' cy='84' r='3.5' fill='white' opacity='.85'/>" +
            "<circle cx='50' cy='70' r='2.5' fill='white' opacity='.75'/>" +
            "<circle cx='152' cy='72' r='2.5' fill='white' opacity='.75'/>" +
            "<circle cx='25' cy='122' r='2' fill='white' opacity='.65'/>" +
            "<circle cx='175' cy='118' r='2' fill='white' opacity='.65'/>"
        ));

        BOOK_DESIGNS.put("don quixote", new BookDesign("#2a1200","#6b3a0a","#d97706","#fde68a",
            // Large bright windmill + white knight silhouette
            "<circle cx='72' cy='115' r='19' fill='none' stroke='#fde68a' stroke-width='3.5'/>" +
            "<line x1='72' y1='96'  x2='72' y2='70'  stroke='#fde68a' stroke-width='6' stroke-linecap='round'/>" +
            "<line x1='72' y1='96'  x2='48' y2='110' stroke='#fde68a' stroke-width='6' stroke-linecap='round'/>" +
            "<line x1='72' y1='96'  x2='96' y2='110' stroke='#fde68a' stroke-width='6' stroke-linecap='round'/>" +
            "<line x1='72' y1='96'  x2='60' y2='80'  stroke='#fde68a' stroke-width='6' stroke-linecap='round'/>" +
            "<rect x='67' y='134' width='10' height='44' fill='#5a3a10' stroke='#fde68a' stroke-width='1.5'/>" +
            "<ellipse cx='152' cy='153' rx='19' ry='14' fill='white' opacity='.72' transform='rotate(-8,152,153)'/>" +
            "<ellipse cx='150' cy='136' rx='10' ry='11' fill='white' opacity='.72'/>" +
            "<ellipse cx='150' cy='123' rx='7'  ry='8'  fill='white' opacity='.72'/>" +
            "<line x1='142' y1='167' x2='139' y2='184' stroke='white' stroke-width='4' opacity='.7'/>" +
            "<line x1='149' y1='167' x2='146' y2='184' stroke='white' stroke-width='4' opacity='.7'/>" +
            "<line x1='157' y1='167' x2='158' y2='184' stroke='white' stroke-width='4' opacity='.7'/>" +
            "<line x1='164' y1='165' x2='167' y2='183' stroke='white' stroke-width='4' opacity='.7'/>" +
            "<line x1='150' y1='140' x2='184' y2='104' stroke='white' stroke-width='3' opacity='.8'/>" +
            "<line x1='0' y1='182' x2='200' y2='182' stroke='#d97706' stroke-width='1.5' opacity='.4'/>"
        ));

        BOOK_DESIGNS.put("the odyssey", new BookDesign("#14080a","#3d1a08","#c2410c","#fed7aa",
            // White ancient vase with bright orange decoration
            "<path d='M66,82 Q56,93 54,134 Q56,163 62,173 L138,173 Q144,163 146,134 Q144,93 134,82 L122,77 L78,77 Z' fill='none' stroke='white' stroke-width='3.5' opacity='.85'/>" +
            "<path d='M78,77 Q100,71 122,77' fill='none' stroke='white' stroke-width='3.5'/>" +
            "<path d='M66,82 Q56,93 54,134 Q56,163 62,173 L138,173 Q144,163 146,134 Q144,93 134,82 L122,77 L78,77 Z' fill='white' opacity='.08'/>" +
            "<path d='M54,113 Q40,100 44,133 Q44,149 54,143' fill='none' stroke='white' stroke-width='3' opacity='.8'/>" +
            "<path d='M146,113 Q160,100 156,133 Q156,149 146,143' fill='none' stroke='white' stroke-width='3' opacity='.8'/>" +
            "<path d='M61,113 Q73,100 85,113 Q97,126 109,113 Q121,100 133,113 Q137,119 139,113' fill='none' stroke='#f97316' stroke-width='3' opacity='.92'/>" +
            "<rect x='60' y='92' width='80' height='7' fill='#c2410c' opacity='.6'/>" +
            "<rect x='60' y='158' width='80' height='7' fill='#c2410c' opacity='.6'/>"
        ));

        BOOK_DESIGNS.put("the brothers karamazov", new BookDesign("#0a0a00","#1a1a00","#b8860b","#fde68a",
            // Large bright gold Orthodox cross
            "<line x1='100' y1='68' x2='100' y2='170' stroke='#ffd700' stroke-width='7' stroke-linecap='round'/>" +
            "<line x1='66'  y1='90' x2='134' y2='90'  stroke='#ffd700' stroke-width='7' stroke-linecap='round'/>" +
            "<line x1='76'  y1='114' x2='124' y2='114' stroke='#ffd700' stroke-width='5' stroke-linecap='round'/>" +
            "<line x1='82'  y1='158' x2='118' y2='176' stroke='#ffd700' stroke-width='5' stroke-linecap='round'/>" +
            "<circle cx='100' cy='86' r='30' fill='none' stroke='rgba(255,215,0,.2)' stroke-width='2'/>" +
            "<circle cx='100' cy='86' r='40' fill='none' stroke='rgba(255,215,0,.1)' stroke-width='1.5'/>" +
            "<rect x='20' y='64' width='160' height='122' rx='4' fill='none' stroke='rgba(255,215,0,.25)' stroke-width='2'/>"
        ));

        // ── Romance ───────────────────────────────────────────────────────────
        BOOK_DESIGNS.put("pride and prejudice", new BookDesign("#0a1a10","#1a3a20","#86efac","#dcfce7",
            // White roses on dark green branch — visible at any size
            "<path d='M56,190 Q66,163 76,144 Q89,120 100,106 Q111,120 124,144 Q134,163 144,190' fill='none' stroke='#2d6a40' stroke-width='3.5'/>" +
            "<line x1='76'  y1='144' x2='54' y2='120' stroke='#2d6a40' stroke-width='3'/>" +
            "<line x1='100' y1='120' x2='73' y2='100' stroke='#2d6a40' stroke-width='3'/>" +
            "<line x1='100' y1='120' x2='130' y2='100' stroke='#2d6a40' stroke-width='3'/>" +
            "<line x1='124' y1='144' x2='148' y2='120' stroke='#2d6a40' stroke-width='3'/>" +
            "<circle cx='54' cy='120' r='13' fill='white' opacity='.9'/>" +
            "<circle cx='54' cy='120' r='8'  fill='#f0fdf4' opacity='.8'/>" +
            "<circle cx='73' cy='100' r='12' fill='white' opacity='.85'/>" +
            "<circle cx='73' cy='100' r='7'  fill='#f0fdf4' opacity='.8'/>" +
            "<circle cx='130' cy='100' r='12' fill='white' opacity='.85'/>" +
            "<circle cx='130' cy='100' r='7'  fill='#f0fdf4' opacity='.8'/>" +
            "<circle cx='148' cy='120' r='13' fill='white' opacity='.9'/>" +
            "<circle cx='148' cy='120' r='8'  fill='#f0fdf4' opacity='.8'/>" +
            "<ellipse cx='64' cy='109' rx='9' ry='4' fill='#4ade80' opacity='.7' transform='rotate(-35,64,109)'/>" +
            "<ellipse cx='140' cy='109' rx='9' ry='4' fill='#4ade80' opacity='.7' transform='rotate(35,140,109)'/>"
        ));

        BOOK_DESIGNS.put("jane eyre", new BookDesign("#100a0a","#1e1010","#e11d48","#fecdd3",
            // Gothic arched window with bright fire inside
            "<rect x='66' y='76' width='68' height='98' fill='none' stroke='white' stroke-width='3' opacity='.6'/>" +
            "<path d='M66,76 Q100,56 134,76' fill='none' stroke='white' stroke-width='3' opacity='.6'/>" +
            "<rect x='68' y='78' width='64' height='94' fill='rgba(255,120,60,.08)'/>" +
            "<line x1='100' y1='76' x2='100' y2='174' stroke='white' stroke-width='1.5' opacity='.4'/>" +
            "<line x1='66'  y1='125' x2='134' y2='125' stroke='white' stroke-width='1.5' opacity='.4'/>" +
            "<path d='M88,172 Q84,150 93,140 Q86,157 97,152 Q91,135 100,126 Q109,135 103,152 Q114,157 107,140 Q116,150 112,172 Z' fill='#ea580c' opacity='.95'/>" +
            "<path d='M93,172 Q91,155 97,146 Q100,155 103,146 Q109,155 107,172 Z' fill='#fde68a' opacity='.9'/>" +
            "<circle cx='34' cy='90' r='2.5' fill='white' opacity='.7'/>" +
            "<circle cx='168' cy='86' r='2.5' fill='white' opacity='.7'/>" +
            "<circle cx='46' cy='68' r='2' fill='white' opacity='.5'/>"
        ));

        BOOK_DESIGNS.put("wuthering heights", new BookDesign("#0a0814","#1a1030","#7c3aed","#ddd6fe",
            // WHITE bare tree on dark moor + white crescent moon
            "<circle cx='154' cy='80' r='20' fill='white' opacity='.9'/>" +
            "<circle cx='161' cy='74' r='16' fill='#0a0814'/>" +
            "<line x1='100' y1='180' x2='100' y2='92' stroke='white' stroke-width='6' stroke-linecap='round' opacity='.9'/>" +
            "<line x1='100' y1='130' x2='66' y2='106' stroke='white' stroke-width='4' stroke-linecap='round' opacity='.85'/>" +
            "<line x1='100' y1='130' x2='135' y2='108' stroke='white' stroke-width='4' stroke-linecap='round' opacity='.85'/>" +
            "<line x1='100' y1='110' x2='74' y2='93' stroke='white' stroke-width='3' stroke-linecap='round' opacity='.8'/>" +
            "<line x1='100' y1='110' x2='126' y2='92' stroke='white' stroke-width='3' stroke-linecap='round' opacity='.8'/>" +
            "<line x1='66' y1='106' x2='50' y2='90' stroke='white' stroke-width='2.5' stroke-linecap='round' opacity='.75'/>" +
            "<line x1='66' y1='106' x2='56' y2='86' stroke='white' stroke-width='2.5' stroke-linecap='round' opacity='.75'/>" +
            "<line x1='135' y1='108' x2='152' y2='93' stroke='white' stroke-width='2.5' stroke-linecap='round' opacity='.75'/>" +
            "<path d='M0,180 Q50,170 100,180 Q150,190 200,180 L200,200 L0,200 Z' fill='#1a1030' opacity='.95'/>"
        ));

        BOOK_DESIGNS.put("the alchemist", new BookDesign("#2a1200","#7c3a00","#f97316","#ffedd5",
            // Bright sun + dark camel against it — naturally high contrast
            "<circle cx='100' cy='106' r='34' fill='#fb923c' opacity='.7'/>" +
            "<circle cx='100' cy='106' r='23' fill='#f97316' opacity='.85'/>" +
            "<circle cx='100' cy='106' r='15' fill='#fcd34d' opacity='.9'/>" +
            "<line x1='100' y1='64'  x2='100' y2='77'  stroke='#fcd34d' stroke-width='2.5' opacity='.65'/>" +
            "<line x1='132' y1='74'  x2='124' y2='84'  stroke='#fcd34d' stroke-width='2.5' opacity='.65'/>" +
            "<line x1='142' y1='106' x2='130' y2='106' stroke='#fcd34d' stroke-width='2.5' opacity='.65'/>" +
            "<line x1='68'  y1='106' x2='56'  y2='106' stroke='#fcd34d' stroke-width='2.5' opacity='.65'/>" +
            "<line x1='68'  y1='74'  x2='76'  y2='84'  stroke='#fcd34d' stroke-width='2.5' opacity='.65'/>" +
            "<rect x='0' y='162' width='200' height='40' fill='#3d1a00' opacity='.9'/>" +
            "<polygon points='28,162 72,108 116,162' fill='#1a0a00' opacity='.92'/>" +
            "<ellipse cx='160' cy='156' rx='23' ry='13' fill='#1a0a00' opacity='.9'/>" +
            "<ellipse cx='150' cy='143' rx='10' ry='11' fill='#1a0a00' opacity='.9'/>" +
            "<path d='M155,141 Q151,127 160,120' fill='none' stroke='#1a0a00' stroke-width='4.5'/>" +
            "<line x1='143' y1='169' x2='141' y2='184' stroke='#1a0a00' stroke-width='3.5'/>" +
            "<line x1='151' y1='169' x2='149' y2='184' stroke='#1a0a00' stroke-width='3.5'/>" +
            "<line x1='165' y1='169' x2='166' y2='184' stroke='#1a0a00' stroke-width='3.5'/>" +
            "<line x1='173' y1='167' x2='175' y2='183' stroke='#1a0a00' stroke-width='3.5'/>"
        ));

        // ── Horror ────────────────────────────────────────────────────────────
        BOOK_DESIGNS.put("frankenstein", new BookDesign("#050c05","#0a1a0a","#16a34a","#bbf7d0",
            // White castle silhouette + large green lightning bolt
            "<rect x='52' y='124' width='96' height='56' fill='white' opacity='.18'/>" +
            "<rect x='52' y='104' width='25' height='22' fill='white' opacity='.18'/>" +
            "<rect x='123' y='104' width='25' height='22' fill='white' opacity='.18'/>" +
            "<rect x='84' y='90' width='32' height='36' fill='white' opacity='.18'/>" +
            "<rect x='52' y='102' width='8' height='6' fill='#050c05'/>" +
            "<rect x='64' y='102' width='8' height='6' fill='#050c05'/>" +
            "<rect x='123' y='102' width='8' height='6' fill='#050c05'/>" +
            "<rect x='135' y='102' width='8' height='6' fill='#050c05'/>" +
            "<rect x='84' y='88' width='7' height='6' fill='#050c05'/>" +
            "<rect x='95' y='88' width='7' height='6' fill='#050c05'/>" +
            "<rect x='106' y='88' width='7' height='6' fill='#050c05'/>" +
            "<rect x='61' y='134' width='12' height='17' rx='2' fill='#4ade80' opacity='.85'/>" +
            "<rect x='94' y='127' width='12' height='17' rx='2' fill='#22c55e' opacity='.75'/>" +
            "<rect x='127' y='134' width='12' height='17' rx='2' fill='#4ade80' opacity='.85'/>" +
            "<polygon points='100,53 87,90 99,90 85,128 118,88 104,88 117,53' fill='#4ade80' opacity='.95'/>"
        ));

        BOOK_DESIGNS.put("dracula", new BookDesign("#0a0000","#1a0000","#991b1b","#fca5a5",
            // Bright white crescent moon + dark castle silhouette
            "<circle cx='152' cy='82' r='30' fill='white' opacity='.92'/>" +
            "<circle cx='161' cy='76' r='26' fill='#0a0000'/>" +
            "<polygon points='26,180 26,118 42,118 42,102 54,102 54,118 78,118 78,94 88,94 88,80 98,80 98,68 108,68 108,80 118,80 118,94 128,94 128,118 152,118 152,114 162,114 162,180' fill='#140000'/>" +
            "<rect x='56' y='123' width='10' height='14' rx='1' fill='#ef4444' opacity='.75'/>" +
            "<rect x='94' y='100' width='10' height='14' rx='1' fill='#ef4444' opacity='.75'/>" +
            "<rect x='130' y='123' width='10' height='14' rx='1' fill='#ef4444' opacity='.75'/>" +
            "<polygon points='0,180 26,156 62,163 100,151 150,159 178,145 200,156 200,200 0,200' fill='#0a0000'/>" +
            "<path d='M44,68 Q38,60 32,63 Q38,68 35,72 Q41,66 44,68 Q47,66 53,72 Q50,68 56,63 Q50,60 44,68' fill='white' opacity='.65'/>" +
            "<path d='M78,54 Q72,46 66,49 Q72,54 69,58 Q75,52 78,54 Q81,52 87,58 Q84,54 90,49 Q84,46 78,54' fill='white' opacity='.65'/>" +
            "<path d='M126,60 Q120,52 114,55 Q120,60 117,64 Q123,58 126,60 Q129,58 135,64 Q132,60 138,55 Q132,52 126,60' fill='white' opacity='.65'/>"
        ));

        // ── Fiction ───────────────────────────────────────────────────────────
        BOOK_DESIGNS.put("the catcher in the rye", new BookDesign("#1a0000","#3d0000","#dc2626","#fca5a5",
            // Large bright red hunting hat + white carousel below
            "<path d='M42,107 Q42,80 68,74 Q100,68 132,74 Q158,80 158,107 Z' fill='#dc2626' opacity='.95'/>" +
            "<rect x='42' y='105' width='116' height='11' fill='#dc2626'/>" +
            "<path d='M42,109 Q25,106 23,115 Q28,125 42,117 Z' fill='#b91c1c' opacity='.9'/>" +
            "<circle cx='100' cy='72' r='5' fill='#b91c1c'/>" +
            "<circle cx='100' cy='158' r='40' fill='none' stroke='white' stroke-width='2.5' opacity='.4'/>" +
            "<circle cx='100' cy='158' r='11' fill='white' opacity='.22'/>" +
            "<line x1='100' y1='147' x2='100' y2='118' stroke='white' stroke-width='1.8' opacity='.35'/>" +
            "<line x1='100' y1='147' x2='129' y2='163' stroke='white' stroke-width='1.8' opacity='.35'/>" +
            "<line x1='100' y1='147' x2='71'  y2='163' stroke='white' stroke-width='1.8' opacity='.35'/>" +
            "<line x1='100' y1='147' x2='134' y2='135' stroke='white' stroke-width='1.8' opacity='.35'/>" +
            "<line x1='100' y1='147' x2='66'  y2='135' stroke='white' stroke-width='1.8' opacity='.35'/>"
        ));

        BOOK_DESIGNS.put("the stranger", new BookDesign("#0f0a00","#1e1500","#d97706","#fde68a",
            // Large blazing sun + dark figure silhouette
            "<circle cx='100' cy='100' r='34' fill='#f59e0b' opacity='.8'/>" +
            "<circle cx='100' cy='100' r='23' fill='#fcd34d' opacity='.9'/>" +
            "<circle cx='100' cy='100' r='15' fill='white' opacity='.72'/>" +
            "<line x1='100' y1='56'  x2='100' y2='70'  stroke='#fcd34d' stroke-width='3.5' opacity='.65'/>" +
            "<line x1='132' y1='67'  x2='125' y2='77'  stroke='#fcd34d' stroke-width='3.5' opacity='.65'/>" +
            "<line x1='144' y1='100' x2='132' y2='100' stroke='#fcd34d' stroke-width='3.5' opacity='.65'/>" +
            "<line x1='132' y1='133' x2='125' y2='123' stroke='#fcd34d' stroke-width='3.5' opacity='.65'/>" +
            "<line x1='68'  y1='133' x2='75'  y2='123' stroke='#fcd34d' stroke-width='3.5' opacity='.65'/>" +
            "<line x1='56'  y1='100' x2='68'  y2='100' stroke='#fcd34d' stroke-width='3.5' opacity='.65'/>" +
            "<rect x='0' y='156' width='200' height='24' fill='#1e4a6a' opacity='.5'/>" +
            "<rect x='0' y='150' width='200' height='8' fill='#7c6000' opacity='.4'/>" +
            "<ellipse cx='100' cy='149' rx='9' ry='10' fill='#0f0a00' opacity='.95'/>" +
            "<rect x='95' y='159' width='10' height='25' fill='#0f0a00' opacity='.95'/>" +
            "<line x1='95' y1='168' x2='79' y2='180' stroke='#0f0a00' stroke-width='3.5'/>" +
            "<line x1='105' y1='168' x2='121' y2='180' stroke='#0f0a00' stroke-width='3.5'/>"
        ));

        BOOK_DESIGNS.put("one hundred years of solitude", new BookDesign("#051505","#0a2a0a","#84cc16","#d9f99d",
            // Large bright green butterflies
            "<path d='M100,127 Q72,90 50,97 Q56,120 79,124 Q85,140 100,133 Z' fill='#84cc16' opacity='.9'/>" +
            "<path d='M100,127 Q128,90 150,97 Q144,120 121,124 Q115,140 100,133 Z' fill='#84cc16' opacity='.9'/>" +
            "<path d='M100,127 Q79,120 67,136 Q80,146 100,138 Z' fill='#4ade80' opacity='.82'/>" +
            "<path d='M100,127 Q121,120 133,136 Q120,146 100,138 Z' fill='#4ade80' opacity='.82'/>" +
            "<line x1='100' y1='127' x2='100' y2='100' stroke='white' stroke-width='2' opacity='.55'/>" +
            "<circle cx='100' cy='127' r='6' fill='white' opacity='.85'/>" +
            "<path d='M40,104 Q34,95 26,97 Q29,106 39,107 Q40,113 40,110 Z' fill='#86efac' opacity='.88'/>" +
            "<path d='M40,104 Q46,95 54,97 Q51,106 41,107 Q40,113 40,110 Z' fill='#86efac' opacity='.88'/>" +
            "<path d='M160,94 Q154,85 146,87 Q149,96 159,97 Q160,103 160,100 Z' fill='#4ade80' opacity='.88'/>" +
            "<path d='M160,94 Q166,85 174,87 Q171,96 161,97 Q160,103 160,100 Z' fill='#4ade80' opacity='.88'/>" +
            "<ellipse cx='30' cy='164' rx='20' ry='9' fill='#166534' opacity='.8' transform='rotate(-25,30,164)'/>" +
            "<ellipse cx='170' cy='160' rx='20' ry='9' fill='#15803d' opacity='.8' transform='rotate(25,170,160)'/>"
        ));
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String title    = param(req, "title",  "Book");
        String author   = param(req, "author", "");
        String category = param(req, "cat",    "Fiction");

        res.setContentType("image/svg+xml;charset=UTF-8");
        res.setCharacterEncoding("UTF-8");
        res.setHeader("Cache-Control", "public, max-age=86400");

        PrintWriter out = res.getWriter();
        out.write(buildSvg(title, author, category));
    }

    private String param(HttpServletRequest req, String name, String def) {
        String v = req.getParameter(name);
        return (v == null || v.isBlank()) ? def : v.trim();
    }

    private BookDesign designFor(String title, String category) {
        BookDesign d = BOOK_DESIGNS.get(title.toLowerCase().trim());
        if (d != null) return d;
        return switch (category.toLowerCase()) {
            case "classic"   -> new BookDesign("#2a1800","#5c3a20","#c49a3c","#fef3c7",categoryArt("classic"));
            case "dystopian" -> new BookDesign("#070711","#0d1117","#4a6fa5","#bfdbfe",categoryArt("dystopian"));
            case "fantasy"   -> new BookDesign("#0a0520","#1a0a40","#9333ea","#e9d5ff",categoryArt("fantasy"));
            case "fiction"   -> new BookDesign("#051505","#0a2a12","#10b981","#d1fae5",categoryArt("fiction"));
            case "horror"    -> new BookDesign("#0a0000","#1a0000","#b91c1c","#fca5a5",categoryArt("horror"));
            case "romance"   -> new BookDesign("#14050a","#2d0a14","#e11d48","#fce7f3",categoryArt("romance"));
            default          -> new BookDesign("#1e293b","#334155","#64748b","#f8fafc",categoryArt("default"));
        };
    }

    private String categoryArt(String cat) {
        return switch (cat) {
            case "classic" ->
                "<rect x='58' y='88' width='84' height='90' rx='2' fill='none' stroke='white' stroke-width='2' opacity='.35'/>" +
                "<line x1='58' y1='103' x2='142' y2='103' stroke='white' stroke-width='1' opacity='.35'/>" +
                "<line x1='58' y1='118' x2='142' y2='118' stroke='white' stroke-width='1' opacity='.35'/>" +
                "<line x1='58' y1='133' x2='142' y2='133' stroke='white' stroke-width='1' opacity='.35'/>";
            case "dystopian" ->
                "<ellipse cx='100' cy='130' rx='48' ry='32' fill='none' stroke='white' stroke-width='3' opacity='.7'/>" +
                "<circle cx='100' cy='130' r='16' fill='white' opacity='.8'/>" +
                "<circle cx='100' cy='130' r='8' fill='#0d1117'/>";
            case "fantasy" ->
                "<polygon points='100,78 110,108 142,108 118,126 127,156 100,138 73,156 82,126 58,108 90,108' fill='#ffd700' opacity='.85'/>";
            case "fiction" ->
                "<circle cx='100' cy='130' r='40' fill='none' stroke='white' stroke-width='2.5' opacity='.5'/>" +
                "<circle cx='100' cy='130' r='26' fill='none' stroke='white' stroke-width='1.5' opacity='.35'/>";
            case "horror" ->
                "<circle cx='100' cy='92' r='25' fill='white' opacity='.82'/>" +
                "<circle cx='108' cy='86' r='20' fill='#0a0000'/>" +
                "<path d='M76,92 Q100,60 124,92 Q100,124 76,92 Z' fill='none' stroke='white' stroke-width='2' opacity='.5'/>";
            case "romance" ->
                "<path d='M100,155 Q68,122 68,100 Q68,78 100,86 Q132,78 132,100 Q132,122 100,155 Z' fill='#ff6b8a' opacity='.8'/>";
            default ->
                "<circle cx='100' cy='130' r='32' fill='none' stroke='white' stroke-width='2.5' opacity='.45'/>";
        };
    }

    private String buildSvg(String title, String author, String category) {
        BookDesign bd = designFor(title, category);

        String safeAuthor = esc(author);
        String safeCat    = esc(category.toUpperCase());

        List<String> lines = wrap(title, 15);
        int totalLines = lines.size();
        int lineH = 13;
        int startY = Math.max(30, 48 - ((totalLines - 1) * lineH) / 2);
        int fontSize = totalLines >= 4 ? 10 : (totalLines == 3 ? 11 : 12);

        StringBuilder titleSvg = new StringBuilder();
        for (int i = 0; i < totalLines; i++) {
            int y = startY + i * lineH;
            titleSvg.append(String.format(
                "<text x='100' y='%d' text-anchor='middle' " +
                "font-family=\"Georgia,'Times New Roman',serif\" font-size='%dpx' " +
                "font-weight='bold' fill='%s' " +
                "style='filter:drop-shadow(0 1px 3px rgba(0,0,0,.9))'>%s</text>%n",
                y, fontSize, bd.text(), esc(lines.get(i))
            ));
        }

        return """
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
              <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
                  <stop offset="0%%"   stop-color="%s"/>
                  <stop offset="50%%"  stop-color="%s"/>
                  <stop offset="100%%" stop-color="%s"/>
                </linearGradient>
                <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%%"   stop-color="rgba(255,255,255,0.10)"/>
                  <stop offset="60%%"  stop-color="rgba(255,255,255,0)"/>
                </linearGradient>
                <linearGradient id="spine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%%"   stop-color="rgba(0,0,0,0.5)"/>
                  <stop offset="100%%" stop-color="rgba(0,0,0,0)"/>
                </linearGradient>
                <filter id="tex">
                  <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise"/>
                  <feColorMatrix type="saturate" values="0" in="noise" result="grey"/>
                  <feBlend in="SourceGraphic" in2="grey" mode="multiply" result="blend"/>
                  <feComposite in="blend" in2="SourceGraphic" operator="in"/>
                </filter>
              </defs>

              <!-- Background -->
              <rect width="200" height="300" fill="url(#bg)"/>

              <!-- Paper texture overlay -->
              <rect width="200" height="300" fill="url(#bg)" filter="url(#tex)" opacity="0.15"/>

              <!-- Spine shadow -->
              <rect x="0" y="0" width="20" height="300" fill="url(#spine)"/>

              <!-- Top shine -->
              <rect x="0" y="0" width="200" height="300" fill="url(#shine)"/>

              <!-- Artwork area -->
              <g transform="translate(0,0)">%s</g>

              <!-- Header region dividers -->
              <rect x="18" y="62" width="164" height="1" fill="%s" opacity="0.4"/>
              <rect x="18" y="235" width="164" height="1" fill="%s" opacity="0.4"/>

              <!-- Top/bottom accent strips -->
              <rect x="0" y="0" width="200" height="4" fill="%s" opacity="0.85"/>
              <rect x="0" y="296" width="200" height="4" fill="%s" opacity="0.7"/>

              <!-- Title block -->
              <rect x="0" y="0" width="200" height="70" fill="rgba(0,0,0,0.42)"/>

              <!-- Category label -->
              <text x="100" y="18" text-anchor="middle"
                font-family="Arial,Helvetica,sans-serif" font-size="7"
                letter-spacing="3.5" fill="%s" opacity="0.75">%s</text>

              <!-- Thin divider under category -->
              <rect x="30" y="24" width="140" height="0.7" fill="%s" opacity="0.3"/>

              <!-- Title text -->
              %s

              <!-- Author -->
              <rect x="0" y="236" width="200" height="60" fill="rgba(0,0,0,0.35)"/>
              <text x="100" y="255" text-anchor="middle"
                font-family="Georgia,'Times New Roman',serif" font-size="11" font-style="italic"
                fill="%s" opacity="0.9">%s</text>

            </svg>
            """.formatted(
                bd.dark(), bd.mid(), bd.dark(),
                bd.artwork(),
                bd.accent(), bd.accent(),
                bd.accent(), bd.accent(),
                bd.accent(), safeCat,
                bd.accent(),
                titleSvg.toString(),
                bd.text(), safeAuthor
            );
    }

    private List<String> wrap(String text, int maxLen) {
        List<String> lines = new ArrayList<>();
        String[] words = text.split(" ");
        StringBuilder cur = new StringBuilder();
        for (String word : words) {
            if (!cur.isEmpty() && cur.length() + 1 + word.length() > maxLen) {
                lines.add(cur.toString());
                cur = new StringBuilder(word);
            } else {
                if (!cur.isEmpty()) cur.append(' ');
                cur.append(word);
            }
        }
        if (!cur.isEmpty()) lines.add(cur.toString());
        return lines;
    }

    private String esc(String s) {
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
