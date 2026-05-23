<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<c:set var="pageTitle" value="My Library"/>
<c:set var="active" value="library"/>
<jsp:include page="_header.jspf"/>

<header style="max-width: 48rem;">
    <p class="tag"><c:out value='${currentUser.name}'/>'s shelf</p>
    <h1>Your library.</h1>
    <p style="font-size: 1.1rem; color: var(--forest-mid); margin-top: 1rem; max-width: 36rem;">
        Books you've borrowed. Return them when you're finished.
    </p>
</header>

<c:if test="${not empty notice}">
    <div class="notice success" style="margin-top: 2rem;">✓ <c:out value='${notice}'/></div>
</c:if>
<c:if test="${not empty error}">
    <div class="notice error" style="margin-top: 2rem;"><c:out value='${error}'/></div>
</c:if>

<c:choose>
    <c:when test="${empty loans}">
        <div class="card" style="margin-top: 3rem; text-align: center; max-width: 32rem; margin-left: auto; margin-right: auto;">
            <h2 style="font-size: 1.75rem;">Your shelf is empty.</h2>
            <p style="color: var(--forest-mid); margin: 0.75rem 0 1.5rem;">A fresh start. Go pick something good.</p>
            <a class="btn btn-primary" href="<c:url value='/classic/books'/>">Browse the catalog</a>
        </div>
    </c:when>
    <c:otherwise>
        <c:set var="hasActive" value="false"/>
        <c:set var="hasPast" value="false"/>
        <c:forEach var="loan" items="${loans}">
            <c:if test="${loan.active}"><c:set var="hasActive" value="true"/></c:if>
            <c:if test="${not loan.active}"><c:set var="hasPast" value="true"/></c:if>
        </c:forEach>

        <c:if test="${hasActive}">
            <section style="margin-top: 3rem;">
                <h2 style="border-bottom: 1px solid rgba(31,63,50,0.1); padding-bottom: 0.75rem;">Currently borrowed</h2>
                <div style="display: grid; gap: 1rem; margin-top: 1.5rem;">
                    <c:forEach var="loan" items="${loans}">
                        <c:if test="${loan.active}">
                            <div class="card" style="display: flex; gap: 1.25rem; align-items: center; padding: 1.25rem;">
                                <a href="<c:url value='/classic/book?id=${loan.bookId}'/>" style="flex-shrink:0; width: 72px;">
                                    <div class="book-cover">
                                        <c:if test="${not empty loan.coverUrl}">
                                            <img src="<c:out value='${loan.coverUrl}'/>" alt="<c:out value='${loan.title}'/>"
                                                 onerror="this.style.display='none';"/>
                                        </c:if>
                                    </div>
                                </a>
                                <div style="flex: 1; min-width: 0;">
                                    <div class="small" style="font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--forest-mid);">
                                        <c:out value='${loan.category}'/>
                                    </div>
                                    <h3 style="font-size: 1.15rem; margin: 0.25rem 0 0.15rem;">
                                        <a href="<c:url value='/classic/book?id=${loan.bookId}'/>"><c:out value='${loan.title}'/></a>
                                    </h3>
                                    <div style="font-style: italic; font-size: 0.85rem; color: var(--forest-mid);">
                                        <c:out value='${loan.author}'/>
                                    </div>
                                    <div style="font-size: 0.75rem; color: var(--forest-mid); margin-top: 0.5rem;">
                                        Borrowed <fmt:formatDate value="${loan.borrowedAt}" pattern="MMM d, yyyy"/>
                                        · Due <fmt:formatDate value="${loan.dueAt}" pattern="MMM d, yyyy"/>
                                    </div>
                                </div>
                                <form method="post" action="<c:url value='/classic/library'/>" style="flex-shrink:0;">
                                    <input type="hidden" name="action" value="return"/>
                                    <input type="hidden" name="loanId" value="${loan.id}"/>
                                    <button class="btn btn-ghost" type="submit">Return</button>
                                </form>
                            </div>
                        </c:if>
                    </c:forEach>
                </div>
            </section>
        </c:if>

        <c:if test="${hasPast}">
            <section style="margin-top: 3rem;">
                <h2 style="border-bottom: 1px solid rgba(31,63,50,0.1); padding-bottom: 0.75rem;">Read &amp; returned</h2>
                <div style="display: grid; gap: 1rem; margin-top: 1.5rem;">
                    <c:forEach var="loan" items="${loans}">
                        <c:if test="${not loan.active}">
                            <div class="card" style="display: flex; gap: 1.25rem; align-items: center; padding: 1.25rem;">
                                <a href="<c:url value='/classic/book?id=${loan.bookId}'/>" style="flex-shrink:0; width: 72px;">
                                    <div class="book-cover">
                                        <c:if test="${not empty loan.coverUrl}">
                                            <img src="<c:out value='${loan.coverUrl}'/>" alt="<c:out value='${loan.title}'/>"
                                                 onerror="this.style.display='none';"/>
                                        </c:if>
                                    </div>
                                </a>
                                <div style="flex: 1; min-width: 0;">
                                    <h3 style="font-size: 1.05rem; margin: 0 0 0.15rem;">
                                        <a href="<c:url value='/classic/book?id=${loan.bookId}'/>"><c:out value='${loan.title}'/></a>
                                    </h3>
                                    <div style="font-style: italic; font-size: 0.85rem; color: var(--forest-mid);">
                                        <c:out value='${loan.author}'/>
                                    </div>
                                    <div style="font-size: 0.75rem; color: var(--forest-mid); margin-top: 0.4rem;">
                                        Returned <fmt:formatDate value="${loan.returnedAt}" pattern="MMM d, yyyy"/>
                                    </div>
                                </div>
                            </div>
                        </c:if>
                    </c:forEach>
                </div>
            </section>
        </c:if>
    </c:otherwise>
</c:choose>

<jsp:include page="_footer.jspf"/>
