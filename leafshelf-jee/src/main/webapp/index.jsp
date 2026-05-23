<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%--
  This page is the welcome file. In production, the React app's index.html is
  built into the WAR root and takes precedence over index.jsp. So this only
  renders when no client/dist has been built, or when accessed explicitly.
--%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>LeafShelf — Online Library</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            background: #f4ede0;
            color: #1f3f32;
            text-align: center;
            padding: 8vh 1rem;
            margin: 0;
        }
        h1 { font-size: clamp(2.5rem, 6vw, 4rem); margin: 0 0 0.5rem; font-weight: 300; }
        .tag { letter-spacing: 0.3em; font-size: 0.8rem; color: #b08d3f; text-transform: uppercase; }
        a {
            display: inline-block;
            margin: 0.5rem;
            padding: 0.85rem 1.5rem;
            border-radius: 999px;
            background: #1f3f32;
            color: #f4ede0;
            text-decoration: none;
            font-family: sans-serif;
            font-size: 0.9rem;
        }
        a.ghost { background: transparent; color: #1f3f32; border: 1px solid #aec5b6; }
        p.lead { max-width: 36rem; margin: 1.5rem auto 2.5rem; color: #356851; line-height: 1.6; }
    </style>
</head>
<body>
    <p class="tag">An online library</p>
    <h1>LeafShelf</h1>
    <p class="lead">
        A small, browseable collection. The modern UI is built with React.
        A classic JSP view is also available, demonstrating the same data
        with JavaBeans and JDBC.
    </p>
    <a href="<%= request.getContextPath() %>/classic">Classic JSP view →</a>
    <a class="ghost" href="<%= request.getContextPath() %>/api/health">API health</a>
</body>
</html>
