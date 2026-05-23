<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Sign in"/>
<c:set var="active" value="login"/>
<jsp:include page="_header.jspf"/>

<div style="display: grid; grid-template-columns: 1fr; gap: 3rem; max-width: 56rem; margin: 2rem auto; align-items: center;">
    <div>
        <h1>Welcome back.</h1>
        <p style="font-size: 1.1rem; color: var(--forest-mid); margin-top: 1rem; max-width: 28rem;">
            Your shelf is exactly where you left it. Sign in and we'll pour the tea.
        </p>
    </div>

    <form class="card" method="post" action="<c:url value='/classic/login'/>" style="max-width: 28rem;">
        <h2 style="margin-bottom: 1.5rem;">Sign in</h2>

        <c:if test="${not empty error}">
            <div class="notice error"><c:out value='${error}'/></div>
        </c:if>

        <div style="margin-bottom: 1.25rem;">
            <label for="email">Email</label>
            <input type="email" name="email" id="email" required value="<c:out value='${email}'/>"/>
        </div>
        <div style="margin-bottom: 1.5rem;">
            <label for="password">Password</label>
            <input type="password" name="password" id="password" required/>
        </div>

        <button class="btn btn-primary" type="submit" style="width: 100%;">Sign in</button>

        <p style="margin-top: 1.5rem; text-align: center; font-size: 0.9rem; color: var(--forest-mid);">
            New here? <a href="<c:url value='/classic/register'/>" style="color: var(--forest-dark); font-weight: 500;">Make a library card</a>
        </p>
    </form>
</div>

<jsp:include page="_footer.jspf"/>
