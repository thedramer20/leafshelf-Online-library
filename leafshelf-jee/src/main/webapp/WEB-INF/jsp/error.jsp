<%@ page contentType="text/html;charset=UTF-8" language="java" isErrorPage="true" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="pageTitle" value="Error"/>
<jsp:include page="_header.jspf"/>

<div style="text-align: center; padding: 4rem 1rem;">
    <p style="font-family: 'Fraunces', serif; font-size: clamp(5rem, 15vw, 10rem); line-height: 1;
              color: rgba(31,63,50,0.15); margin: 0;">
        <c:choose>
            <c:when test="${not empty pageContext.errorData.statusCode}">${pageContext.errorData.statusCode}</c:when>
            <c:otherwise>!</c:otherwise>
        </c:choose>
    </p>
    <h1 style="margin-top: -1rem;">Something went wrong.</h1>
    <p style="color: var(--forest-mid); margin: 1rem auto 2rem; max-width: 28rem;">
        Maybe a leaf turned. Try the catalog — there's plenty to read.
    </p>
    <a class="btn btn-primary" href="<c:url value='/classic'/>">Back to the library</a>
</div>

<jsp:include page="_footer.jspf"/>
