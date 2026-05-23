<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<jsp:useBean id="book" type="com.leafshelf.beans.Book" scope="request"/>
<c:set var="pageTitle" value="${book.title}"/>
<c:set var="active" value="books"/>
<jsp:include page="_header.jspf"/>

<a href="<c:url value='/classic/books'/>" style="font-size: 0.85rem; color: var(--forest-mid); display: inline-block; margin-bottom: 1.5rem;">
    ← Back to catalog
</a>

<div style="display: grid; grid-template-columns: 1fr; gap: 2.5rem; max-width: 56rem;">
    <div style="display: grid; grid-template-columns: minmax(220px, 280px) 1fr; gap: 2.5rem; align-items: start;">

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
        </div>

        <div>
            <span class="chip gold"><c:out value='${book.category}'/></span>
            <h1 style="margin-top: 0.75rem;"><c:out value='${book.title}'/></h1>
            <p style="font-size: 1.1rem; font-style: italic; color: var(--forest-mid); margin-top: 0.25rem;">
                by <c:out value='${book.author}'/>
            </p>

            <div style="display: flex; flex-wrap: wrap; gap: 1rem 1.5rem; margin-top: 1.5rem; font-size: 0.85rem; color: var(--forest-mid);">
                <c:if test="${not empty book.publishedYear}">
                    <span><span style="opacity:0.7;">First published</span> ${book.publishedYear}</span>
                </c:if>
                <c:if test="${not empty book.pages}">
                    <span><span style="opacity:0.7;">Pages</span> ${book.pages}</span>
                </c:if>
                <span><span style="opacity:0.7;">Rating</span> ★ <fmt:formatNumber value="${book.rating}" minFractionDigits="1" maxFractionDigits="1"/></span>
                <c:if test="${not empty book.isbn}">
                    <span><span style="opacity:0.7;">ISBN</span> <c:out value='${book.isbn}'/></span>
                </c:if>
            </div>

            <p style="margin-top: 2rem; font-size: 1.05rem; line-height: 1.7; color: var(--forest);">
                <c:out value='${book.description}'/>
            </p>
        </div>
    </div>

    <div class="card" style="max-width: 36rem;">
        <p class="tag">Availability</p>
        <h3 style="font-size: 1.5rem; margin: 0.5rem 0 1.5rem;">
            <c:choose>
                <c:when test="${book.available}">
                    ${book.availableCopies} of ${book.totalCopies} on the shelf
                </c:when>
                <c:otherwise>
                    All copies are currently out
                </c:otherwise>
            </c:choose>
        </h3>

        <c:if test="${not empty error}">
            <div class="notice error"><c:out value='${error}'/></div>
        </c:if>
        <c:if test="${not empty success}">
            <div class="notice success">✓ <c:out value='${success}'/></div>
        </c:if>

        <c:choose>
            <c:when test="${empty currentUser}">
                <a class="btn btn-primary" href="<c:url value='/classic/login'/>">Sign in to borrow</a>
            </c:when>
            <c:when test="${not empty activeLoan}">
                <button class="btn btn-ghost" disabled>Already on your shelf</button>
            </c:when>
            <c:when test="${not book.available}">
                <button class="btn btn-ghost" disabled>Unavailable</button>
            </c:when>
            <c:otherwise>
                <form method="post" action="<c:url value='/classic/book'/>" style="display: inline;">
                    <input type="hidden" name="bookId" value="${book.id}"/>
                    <input type="hidden" name="id" value="${book.id}"/>
                    <button class="btn btn-primary" type="submit">Borrow this book</button>
                </form>
            </c:otherwise>
        </c:choose>
    </div>
</div>

<jsp:include page="_footer.jspf"/>
