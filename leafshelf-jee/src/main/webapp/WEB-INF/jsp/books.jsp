<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<c:set var="pageTitle" value="Catalog"/>
<c:set var="active" value="books"/>
<jsp:include page="_header.jspf"/>

<header style="max-width: 48rem;">
    <p class="tag">The catalog</p>
    <h1>Every book on the shelf.</h1>
    <p style="font-size: 1.1rem; color: var(--forest-mid); max-width: 36rem; margin: 1rem 0 0;">
        A small, carefully chosen collection — fiction, history, science, a little poetry of thought. Pick one.
    </p>
</header>

<form method="get" action="<c:url value='/classic/books'/>" style="margin-top: 2rem; display: flex; gap: 0.75rem; flex-wrap: wrap; max-width: 32rem;">
    <input type="search" name="search" placeholder="Search by title, author, or theme…"
           value="<c:out value='${search}'/>" style="flex: 1;">
    <input type="hidden" name="category" value="<c:out value='${activeCategory}'/>">
    <button class="btn btn-primary" type="submit">Search</button>
</form>

<div style="margin-top: 1.25rem;">
    <a class="chip ${empty activeCategory ? 'active' : ''}"
       href="<c:url value='/classic/books'/>">
        All
    </a>
    <c:forEach var="cat" items="${categories}">
        <a class="chip ${activeCategory == cat ? 'active' : ''}"
           href="<c:url value='/classic/books'><c:param name='category' value='${cat}'/></c:url>">
            <c:out value='${cat}'/>
        </a>
    </c:forEach>
</div>

<p style="margin-top: 2rem; font-size: 0.85rem; color: var(--forest-mid);">
    <c:choose>
        <c:when test="${empty books}">No books match that search.</c:when>
        <c:when test="${books.size() == 1}">1 book</c:when>
        <c:otherwise>${books.size()} books</c:otherwise>
    </c:choose>
</p>

<div class="grid-books">
    <c:forEach var="book" items="${books}">
        <%-- Use <jsp:useBean> to formally declare the Book bean type for this iteration --%>
        <jsp:useBean id="book" type="com.leafshelf.beans.Book" scope="page"/>
        <a class="book-card" href="<c:url value='/classic/book?id=${book.id}'/>">
            <div class="book-cover">
                <c:choose>
                    <c:when test="${not empty book.coverUrl}">
                        <img src="<c:out value='${book.coverUrl}'/>" alt="<c:out value='${book.title}'/>"
                             onerror="this.style.display='none';" />
                    </c:when>
                    <c:otherwise>
                        <div class="fallback">
                            <div><small>LeafShelf</small><br/><br/><c:out value='${book.title}'/></div>
                            <div><em><c:out value='${book.author}'/></em></div>
                        </div>
                    </c:otherwise>
                </c:choose>
                <span class="dot ${book.available ? 'available' : 'taken'}"></span>
            </div>
            <div class="book-meta">
                <div class="small"><c:out value='${book.category}'/></div>
                <h3><c:out value='${book.title}'/></h3>
                <div class="author"><c:out value='${book.author}'/></div>
                <div class="extra">
                    ★ <fmt:formatNumber value="${book.rating}" minFractionDigits="1" maxFractionDigits="1"/>
                    ·
                    <c:choose>
                        <c:when test="${book.available}">${book.availableCopies} available</c:when>
                        <c:otherwise>Checked out</c:otherwise>
                    </c:choose>
                </div>
            </div>
        </a>
    </c:forEach>
</div>

<jsp:include page="_footer.jspf"/>
