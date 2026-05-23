<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<c:set var="pageTitle" value="Home"/>
<c:set var="active" value="home"/>
<jsp:include page="_header.jspf"/>

<section style="display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: center;">
    <div>
        <span class="chip gold">● An online library</span>
        <h1 style="margin-top: 1rem;">
            A quiet shelf<br>for the <em style="color: var(--gold-dark);">noisy</em> world.
        </h1>
        <p style="font-size: 1.1rem; color: var(--forest-mid); max-width: 36rem; margin: 1.5rem 0 2rem;">
            LeafShelf is a small, browseable library. This is the classic view — every page on this
            site is rendered by a JSP, with data fetched through JavaBeans and JDBC.
        </p>
        <div>
            <a class="btn btn-primary" href="<c:url value='/classic/books' />">Browse the catalog →</a>
            <c:if test="${empty currentUser}">
                <a class="btn btn-ghost" href="<c:url value='/classic/register' />">Create an account</a>
            </c:if>
        </div>
    </div>
</section>

<section style="margin-top: 4rem;">
    <p class="tag">On the shelf this week</p>
    <h2 style="margin-bottom: 2rem;">Recently catalogued</h2>

    <div class="grid-books">
        <c:forEach var="book" items="${featured}">
            <a class="book-card" href="<c:url value='/classic/book?id=${book.id}'/>">
                <div class="book-cover">
                    <c:choose>
                        <c:when test="${not empty book.coverUrl}">
                            <img src="${book.coverUrl}" alt="<c:out value='${book.title}'/>"
                                 onerror="this.style.display='none'; this.parentElement.classList.add('fallback-on');" />
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
</section>

<section style="margin-top: 4rem; text-align: center;">
    <p class="tag">How it works</p>
    <h2 style="margin-bottom: 2rem;">Three small steps</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;">
        <div class="card">
            <div style="font-family: 'Fraunces', serif; font-size: 2rem; color: var(--gold);">01</div>
            <h3 style="font-size: 1.25rem; margin-top: 0.5rem;">Make a card</h3>
            <p style="color: var(--forest-mid); font-size: 0.9rem; margin: 0.5rem 0 0;">Register in under a minute.</p>
        </div>
        <div class="card">
            <div style="font-family: 'Fraunces', serif; font-size: 2rem; color: var(--gold);">02</div>
            <h3 style="font-size: 1.25rem; margin-top: 0.5rem;">Find a book</h3>
            <p style="color: var(--forest-mid); font-size: 0.9rem; margin: 0.5rem 0 0;">Browse by category or search.</p>
        </div>
        <div class="card">
            <div style="font-family: 'Fraunces', serif; font-size: 2rem; color: var(--gold);">03</div>
            <h3 style="font-size: 1.25rem; margin-top: 0.5rem;">Borrow &amp; return</h3>
            <p style="color: var(--forest-mid); font-size: 0.9rem; margin: 0.5rem 0 0;">Two weeks per book.</p>
        </div>
    </div>
</section>

<jsp:include page="_footer.jspf"/>
