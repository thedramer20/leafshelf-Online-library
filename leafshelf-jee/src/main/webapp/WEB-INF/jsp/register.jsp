<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Register"/>
<c:set var="active" value="login"/>
<jsp:include page="_header.jspf"/>

<div style="display: grid; grid-template-columns: 1fr; gap: 3rem; max-width: 56rem; margin: 2rem auto;">
    <div>
        <h1>Make a library card.</h1>
        <p style="font-size: 1.1rem; color: var(--forest-mid); margin-top: 1rem; max-width: 28rem;">
            It takes a minute. We'll keep your reading history private and your shelf yours.
        </p>
    </div>

    <form class="card" method="post" action="<c:url value='/classic/register'/>" style="max-width: 28rem;">
        <h2 style="margin-bottom: 1.5rem;">Create your account</h2>

        <c:if test="${not empty error}">
            <div class="notice error"><c:out value='${error}'/></div>
        </c:if>

        <div style="margin-bottom: 1.25rem;">
            <label for="name">Your name</label>
            <input type="text" name="name" id="name" required minlength="2" value="<c:out value='${name}'/>"/>
        </div>
        <div style="margin-bottom: 1.25rem;">
            <label for="email">Email</label>
            <input type="email" name="email" id="email" required value="<c:out value='${email}'/>"/>
        </div>
        <div style="margin-bottom: 1.5rem;">
            <label for="password">Password</label>
            <input type="password" name="password" id="password" required minlength="6"/>
        </div>

        <button class="btn btn-primary" type="submit" style="width: 100%;">Create account</button>

        <p style="margin-top: 1.5rem; text-align: center; font-size: 0.9rem; color: var(--forest-mid);">
            Already have an account? <a href="<c:url value='/classic/login'/>" style="color: var(--forest-dark); font-weight: 500;">Sign in</a>
        </p>
    </form>
</div>

<jsp:include page="_footer.jspf"/>
