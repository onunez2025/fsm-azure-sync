# Query API Documentation

Field Service Management - Query API
Generated on: 2025-12-18 22:49:31 GMT+0000
SAP Field Service Management | Cloud
Public
Original content: https://help.sap.com/docs/SAP_FIELD_SERVICE_MANAGEMENT/fsm_query_api?locale=en-
US&state=PRODUCTION&version=Cloud
Warning
This document has been generated from SAP Help Portal and is an incomplete version of the official SAP product documentation.
The information included in custom documentation may not reflect the arrangement of topics in SAP Help Portal, and may be
missing important aspects and/or correlations to other topics. For this reason, it is not for production use.
For more information, please visit https://help.sap.com/docs/disclaimer.
12/18/25, 10:49 PM
1
This is custom documentation. For more information, please visit SAP Help Portal.


Intro
The Query API works with POST HTTP requests. Queries can also be performed using the Admin Query API located in the Admin
module.
A request made to the Query API should use the following template:
Request
Method
URL
POST
https://{cluster}.fsm.cloud.sap/api/query/v1?
URL Parameters
Parameter
Description
Type
Required
Example
user
The user name.
String
Required
myUserName
account
The name of the account for which the request is being
made.
String
Required
myAccountName
company
The name of the company.
String
Required
myCompanyName
dtos
The data transfer object/s and their version being queried.
Please note how this text is constructed:
String
Required
BusinessPartner.17;ServiceCall.
 Important
Please be informed that several non-backwards compatible changes will be introduced in Query API and Data API 4 on 1 of
December 2021.
In essence the following restrictions will apply:
Maximum page size will be limited to 1000 objects
Maximum number of objects retrievable via standard pagination will be limited to 100,000 objects
For SAP FSM tenants created after 24.01.2021 the API restrictions are already enabled.
More details can be found here.
 Warning
Ignore this page and refer to the following topic if you plan to use the Query API without username and password and log-in
using federated authentication instead.
 Attention
Please note that we will migrate and unify the .coresystems.net and .coresuite.com domains into the new
fsm.cloud.sap. superdomain. This new superdomain is already operable. We highly encourage you to start using the new
domain. These changes are already reflected in the documentation.
For more information please refer to the following announcement: Common Superdomain for Saas Applications.
12/18/25, 10:49 PM
2
This is custom documentation. For more information, please visit SAP Help Portal.


Parameter
Description
Type
Required
Example
Resource1.Version;Resource2.Version;….;ResourceN.Version
Headers
Header
Description
Required
Example
X-Request-ID
Request id for request tracing, helps to identify your request in the
system
Optional
825adf80-9f1e-4e7d-90-
704818fb2e00
X-Client-ID
Your client identifier. For information on generating client ID and
secret, refer to the following.
Required
COR_CONNECTOR
X-Client-
Version
Your client version
Required
0.0.1
Authorization
OAuth 2.0 token.
Required
bearer <access_token>
Request Body
The request body consists of a SELECT statement containing supported operators, as shown in the following example:
Example Query API Request
In the following example, we will retrieve the first three pairs of (businessPartner, serviceCall). In each pair there is this
relation:
The Service Call is connected to its Business Partner by bp=sc.businessPartner
Request
Method
URL
POST
https://{cluster}.fsm.cloud.sap/api/query/v1?
&account=scribe&company=Ambit%20AG&dtos=BusinessPartner.17;ServiceCall.17
Request Body
{"query":"SELECT bp.id, bp.name, sc.id FROM BusinessPartner bp JOIN ServiceCall sc ON bp=sc.busines
 Attention
Please note that we will migrate and unify the .coresystems.net and .coresuite.com domains into the new
fsm.cloud.sap. superdomain. This new superdomain is already operable. We highly encourage you to start using the new
domain. These changes are already reflected in the documentation.
For more information please refer to the following announcement: Common Superdomain for Saas Applications.
{"query":"SELECT bp.id, bp.name, sc.id FROM BusinessPartner bp JOIN ServiceCall sc ON bp=sc.busines
12/18/25, 10:49 PM
3
This is custom documentation. For more information, please visit SAP Help Portal.


Example Response
When the request is valid, the Query API response code will be:
HTTP 200 OK
Example Response Body
Pagination
Example Scenario
Let’s use the following use case for when pagination could be applied.
{
  "data": [
    {
      "bp": {
        "name": "demoCompany ag",
        "id": "01C47598942C4FAF947B47713D9894F7"
      },
      "sc": {
        "id": "9480410F42DA4161AA5A044A401C6EC7"
      }
    },
    {
      "bp": {
        "name": "ALDI",
        "id": "12A7CCDDFC2A48E1833B3BABAB35A477"
      },
      "sc": {
        "id": "48A74A9DCB484F27B2943FA3BDC9A6AD"
      }
    },
    {
      "bp": {
        "name": "Marionnaud Parfumeries",
        "id": "B6F4D0A207994A45A0C6BDE3318247C8"
      },
      "sc": {
        "id": "DB771E994B03490EAED27E55B1CDE260"
      }
    }
  ]
}
 Important
Please be informed that several non-backwards compatible changes will be introduced in Query API and Data API 4 on 1 of
December 2021.
In essence the following restrictions will apply:
Maximum page size will be limited to 1000 objects
Maximum number of objects retrievable via standard pagination will be limited to 100,000 objects
For SAP FSM tenants created after 24.01.2021 the API restrictions are already enabled.
More details can be found here.
12/18/25, 10:49 PM
4
This is custom documentation. For more information, please visit SAP Help Portal.


The following statement:
…would return 19,484 Activities!
The new requirement is: we want to see the results page by page. This is what the pagination concept addresses.
We must define two things:
The page we want to get and how many pairs we see on a page.
The page size. (both must be natural numbers greater then zero).
If we want the page number 10 (of the total of 6,495 pages), having 3 Activities in a page, then we have to build our call like this:
Sample Request
Method
URL
POST
https://api/query/v1? … page=10&amp; pageSize=3
Example Request Body
The query looks the same:
Example Response Body
SELECT a.id FROM Activity a 
 Attention
Please note that we will migrate and unify the .coresystems.net and .coresuite.com domains into the new
fsm.cloud.sap. superdomain. This new superdomain is already operable. We highly encourage you to start using the new
domain. These changes are already reflected in the documentation.
For more information please refer to the following announcement: Common Superdomain for Saas Applications.
{"query":"SELECT a.id FROM Activity a"} 
{
   "data": [
      {
         "a": {
            "id": "2BE101205E5640E081BA3D4A52E53E7A"
         }
      },
      {
         "a": {
            "id": "FEAC31F0D8274830B1289DF0BD20C2F1"
         }
      },
      {
         "a": {
            "id": "65F77D4AB5D440389D06F4E16B6F574C"
         }
      }
   ],
   "pageSize": 3,
   "currentPage": 10,
12/18/25, 10:49 PM
5
This is custom documentation. For more information, please visit SAP Help Portal.


This time, the query response contains the pagination information:
The pageSize represents the number of pairs shown in a page;
The currentPage represents the index of the page we got (10 of the total of 6,495 pages).
The lastPage represents the index of the last available page.
The totalObjectCount represents the number of pairs (only Activities in this case) that the query returns if no pagination
were used.
Limitations
we cannot use pagination in combination with OFFSET and/or LIMIT. Because, behind the scenes, pagination introduces its own
OFFSET/LIMIT in the query.
Query API Guide
About this Guide
The following section describes in more detail how you can write your own CoreSQL queries. CoreSQL is limited to the SQL clauses
and expressions described below.
Attention: Offset/Limit is not supported by the Query API. It is recommended to use the Analytics & Reporting app to limit the
number of records returned.
SELECT Clause
By using this Query API, we can query for resources in an SQL-like fashion, similar to querying in database tables.
The SELECT clause has similar semantics like in SQL. For example:
   "lastPage": 6495,
   "totalObjectCount": 19484
} 
 Important
Please be informed that several non-backwards compatible changes will be introduced in Query API and Data API 4 on 1 of
December 2021.
In essence the following restrictions will apply:
Maximum page size will be limited to 1000 objects
Maximum number of objects retrievable via standard pagination will be limited to 100,000 objects
For SAP FSM tenants created after 24.01.2021 the API restrictions are already enabled.
More details can be found here.
SELECT bp FROM BusinessPartner bp LIMIT 2
12/18/25, 10:49 PM
6
This is custom documentation. For more information, please visit SAP Help Portal.


Here, we query for the first two resources of type BusinessPartner (bp). Each resource must have a declaration part. This is done in
the FROM and/or JOIN clauses. In this case, the resource declaration is BusinessPartner bp in the FROM clause. The query above
returns all the fields (defined in the BusinessPartner’s DTO version) of the first two Business Partners. If we want to get only some
fields of the resource, a query like this can be performed:
This query returns the fields id, lastChanged and creditLimit for all the Business Partners.
The Business Partner’s creditLimit is a complex field defined inside a Business Partner object. In the SELECT clause, we cannot
ask for specific fields inside a complex type (ex. SELECT bp.creditLimit.amount FROM BusinessPartner bp).
On the other hand such fields can be used in expressions (ex. SELECT bp.creditLimit FROM BusinessPartner bp WHERE
bp.creditLimit.amount>0)
Also, we can have more than one resource in a SELECT clause:
This query returns the first two pairs of (Business Partner, Service Call) that have this relation between them:
bp=sc.businessPartner
Limitations
We cannot navigate between resources using the dot syntax. The example below will not work:
In this example, the paymentType is a different resource than the Business Partner (bp). If we want to get the paymentType.id, we
have to make a query like:
We cannot ask for specific fields of a complex type. The example below will not work:
In this example, the creditLimit is a complex type inside the Business Partner. The SELECT clause requires that we get all the fields
of a complex type or none of them.
On the other hand, we can use fields of a complex type in WHERE, JOINs, ORDER BY expressions.
This will work:
WHERE Clause
Like in SQL, we use the WHERE clause for resource filtering based on expressions.
SELECT bp.id, bp.lastChanged, bp.creditLimit FROM BusinessPartner bp
SELECT bp.id, bp.city, bp.name, sc.id, sc.subject FROM BusinessPartner bp JOIN ServiceCall sc ON bp
SELECT bp.paymentType.id FROM BusinessPartner bp
SELECT pt.id FROM PaymentType pt JOIN BusinessPartner bp ON bp.paymentType=pt
SELECT bp.creditLimit.amount FROM BusinessPartner bp
SELECT bp.creditLimit FROM BusinessPartner bp WHERE bp.creditLimit.amount>0
12/18/25, 10:49 PM
7
This is custom documentation. For more information, please visit SAP Help Portal.


For more filtering possibilities, please visit the Expressions section.
FROM Clause
Each resource we use in the query must be declared in FROM or JOINs clauses. Like in SQL, a resource declaration looks like
ResourceType resource
In this example we have two declarations: BusinessPartner bp and ServiceCall sc, separated by a comma.
ORDER BY Clause
If we need to sort the results, we should use the ORDER BY clause.
We can use multiple sorting criteria separated by a comma. If we don’t specify the sorting type (`Ascending ASC or Descending
DESC), by default, we will be using the Ascending sorting type.
Example with Ascending / Descending
JOIN Clause
The JOIN clause can be used as follows:
Example 1
Example 2
SELECT bp.name, 
       bp.lastChanged, 
       bp.creditLimit 
FROM   BusinessPartner bp 
WHERE  Upper(bp.name) LIKE '%TAY%' 
       AND bp.lastChanged > '2014-01-01'        
SELECT bp, sc FROM BusinessPartner bp, ServiceCall sc
SELECT a
FROM   Activity a
ORDER  BY a.lastChanged
SELECT a
FROM   Activity a
ORDER  BY a.type ASC,
          a.lastChanged DESC
SELECT sc,
       bp
FROM   ServiceCall sc
       JOIN BusinessPartner bp
         ON bp = sc.businessPartner 
12/18/25, 10:49 PM
8
This is custom documentation. For more information, please visit SAP Help Portal.


Observation: Instead of using bp=sc.businessPartner we can use bp.id=sc.businessPartner (this is the same thing).
LEFT JOIN (or LEFT OUTER JOIN)
The following is an example of how LEFT JOIN (or LEFT OUTER JOIN) can be applied:
Left Join
Left Outer Join
RIGHT JOIN (or RIGHT OUTER JOIN)
The following is an example of how RIGHT JOIN (or RIGHT OUTER JOIN) can be applied:
Right Join
Right Outer Join
FULL OUTER JOIN
The following is an example of how FULL OUTER JOIN can be used:
SELECT sc, 
       bp 
FROM   servicecall sc 
       INNER JOIN businesspartner bp 
               ON bp = sc.businesspartner 
SELECT sc,
       bp
FROM   ServiceCall sc
       LEFT JOIN BusinessPartner bp
         ON bp = sc.businessPartner
SELECT sc,
       bp
FROM   ServiceCall sc
       LEFT OUTER JOIN BusinessPartner bp
                    ON bp = sc.businessPartner 
SELECT sc,
       bp
FROM   ServiceCall sc
       RIGHT JOIN BusinessPartner bp
         ON bp = sc.businessPartner
SELECT sc,
       bp
FROM   ServiceCall sc
       RIGHT OUTER JOIN BusinessPartner bp
                     ON bp = sc.businessPartner 
12/18/25, 10:49 PM
9
This is custom documentation. For more information, please visit SAP Help Portal.


Supported JOIN Types
According to the relation between resources, we support three join types:
Resources That Have a Direct Connection between Them
Resources That Have an Indirect Connection between Them
Resources in Collections of Resources
Resources That Have a Direct Connection between Them
The following is an example of a query using a JOIN clause for resources with a direct connection:
In this example, the ServiceCall (sc) resource has a field named businessPartner which is a reference to the resource
BusinessPartner (bp).
Resources That Have an Indirect Connection between Them
The following is an example query containing a JOIN statement for resources with an indirect connection:
SELECT sc,
       bp
FROM   ServiceCall sc
       FULL OUTER JOIN BusinessPartner bp
                    ON bp = sc.businessPartner
SELECT sc,
       bp
FROM   ServiceCall sc
       JOIN BusinessPartner bp
         ON bp = sc.businessPartner 
SELECT sc,
       bp
FROM   ServiceCall sc
       JOIN BusinessPartner bp
         ON bp.id = sc.businessPartner 
 Note
All four queries below are equivalent.
SELECT a, 
       bp 
FROM   Activity a 
       JOIN BusinessPartner bp 
         ON a.object = bp 
SELECT a, 
       bp 
FROM   Activity a 
       JOIN BusinessPartner bp 
         ON a.object = bp.id 
SELECT a, 
       bp 
12/18/25, 10:49 PM
10
This is custom documentation. For more information, please visit SAP Help Portal.


In this case, an Activity has a field named object (this field, can refer to any resource). The joining condition says that, for this case,
the resource is a BusinessPartner (bp).
Resources in Collections of Resources
The following is an example of a JOIN can be performed for resources in a collection of resources:
In this case, the BusinessPartner (bp) resource, has a collection of persons named salesPersons.
Other Joins
Basically, we can use any expression for completing a JOIN:
In this example, we ask for different Activity pairs (a1 , a2) that have the same endDateTime.
When this is the case, we will get this error message:
In this case we will have to reconsider our JOIN.
FROM   Activity a 
       JOIN BusinessPartner bp 
         ON a.object.objectid = bp 
SELECT a, 
       bp 
FROM   Activity a 
       JOIN BusinessPartner bp 
         ON a.object.objectid = bp.id 
SELECT bp,
       sp
FROM   BusinessPartner bp
       LEFT JOIN Person sp
              ON sp IN bp.salesPersons
SELECT ac1.id,
       ac1.endDateTime,
       ac2.id,
       ac2.endDateTime
FROM   Activity ac1
       JOIN Activity ac2
         ON ac1.endDateTime = ac2.endDateTime
WHERE  ac1 != ac2 
 Limitations
Internally, the query we write is transformed into a database query. Because of some database limitations, some joining
conditions are not possible for RIGHT JOIN or FULL OUTER JOIN.
{
   "error": "CA-135",
   "message": "Can not perform query, because of a database error: [{0}]",
   "values": [
      "ERROR: FULL JOIN is only supported with merge-joinable or hash-joinable join conditions"
   ]
}
12/18/25, 10:49 PM
11
This is custom documentation. For more information, please visit SAP Help Portal.


Supported Data Types
The following data types are supported by the Query API:
Name
Description
Example
TEXT
Use simple quote for texts.
Use a backslash ( \ ) as an escape character to include special characters like
apostrophes in a string.
'abc'
'1234'
'Pont-l\'Abbé'
NUMBER
A number can be: a integer or a real number.
15; -15; 10.2; -10.2
BOOLEAN
we can mix lower cases with upper cases.
true; false; TRUE;
FALSE; trUE
DATE
In operations that require DATE parameters,
TEXT or NUMBER tokens are converted to DATE.
For example: bp.lastChanged: '2015-02-15' or bp.lastChanged > 1429794685185
(Get all the Business Partners with the lastChanged greater than 2015-02-15)
(Get all the Business Partners with the lastChanged greater than the timestamp
1429794685185)
For a TEXT to be converted into a date, it should follow a pattern: yyyy-MM-
dd'T'HH:mm:ss'Z'; yyyy-MM-dd; yyyyMMdd<
As text:
'2015-02-
18T15:58:00Z'
'2015-02-18'
'20150218'
As timestamp:
1429794685185
REFERENCE
(In the next version, we will
rename this to
IDENTIFIER)
By reference we mean object identifier (e.g. bp.id).
In operations that requires REFERENCE parameters,
TEXT tokens are converted to REFERENCE.
For example:
bp.id = '7C3A701C77194291B6CC0BEA817E4D36'
(Get the Business Partner with
the ID '7C3A701C77194291B6CC0BEA817E4D36')
Each time we use the resource name
(not its fields) into some expression,
it will be evaluated to a
REFERENCE type. For example:
bp = '7C3A701C77194291B6CC0BEA817E4D36' is the same as bp.id =
'7C3A701C77194291B6CC0BEA817E4D36'
Each time we use the resource name (not its fields)
in a SELECT clause, it will be interpreted as
"give me all fields of this resource".
'7C3A701C 7719429
1B6CC0BEA
817E4D36'
REFERENCE_COLLECTION
(In the next version,
we will
rename this to
IDENTIFIER_COLLECTION)
This represents a collection of identifiers.
For example, the Business Partner has a field named groups.
This field stores a list of group identifiers.
This type can be used only in one operation: IN.
For example: We want to check if a Business Partner
belongs to some group with the identifier
'CA9EFA06A5F94EBD90CA26AE13B51DA5'.
bp.groups
`>SELECT bp FROM BusinessPartner bp,
Group g WHERE g.id IN bp.groups
12/18/25, 10:49 PM
12
This is custom documentation. For more information, please visit SAP Help Portal.


Name
Description
Example
Operations
The following operations are supported:
Name
Description
Example
arg1 - arg2
arg1 + arg2
arg1 * arg2
arg1 / arg2
All those operations accept
NUMBER arguments (arg1 and
arg2).
For + operation, arg1 and arg2
can be also TEXT. When this is the
case, the result will be a text
concatenation.
1 + 2 = 3
'1' + '2' = '12'
arg1 = arg2
arg1 <= arg2
arg1 >= arg2
arg1 < arg2
arg1 > arg2
arg1 <> arg2
arg1 != arg2
All those operations work with
TEXT, NUMBER and DATE
arguments (arg1 and arg2).
The =, != and <> works also with
REFERENCE and BOOLEAN
arguments type.
The != and <> operations do the
same thing. We support both,
because some users prefer
different syntax.
In operations where one of the
arguments is a DATE and the
other is a TEXT (or NUMBER), the
TEXT (or NUMBER) will be
converted to a DATE.
In operations where one of the
arguments is a REFERENCE and
the other is a TEXT, the TEXT will
be converted to a REFERENCE.
10 = 10
'KX200' != bp.code
TEXT converted to a REFERENCE:
bp.id = '807E1D4F403643A2B7942DF98029B2CE'
NUMBER converted to a DATE:
bp.lastChanged != 1429794685185
TEXT converted to a DATE:
bp.lastChanged <> '2015-09-20'
arg1 AND arg2
arg1 OR arg2
NOT arg1
! arg1
NOT and ! operations do the
same thing.
All those operations allow
BOOLEAN arguments (arg1 and
arg2).
true OR (1>5)
true or (1>5)
!(1>5)
not (1>5)
NOT (1>5)
AND g.id='CA9EFA06A5F94EBD90CA26AE13B51DA5'
//or... using the sugar syntax (in expressions, g=g.id)
SELECT bp FROM BusinessPartner bp,
Group g WHERE g IN bp.groups
AND g='CA9EFA06A5F94EBD90CA26AE13B51DA5'
`
12/18/25, 10:49 PM
13
This is custom documentation. For more information, please visit SAP Help Portal.


Name
Description
Example
arg1 IS NULL
arg1 IS NOT NULL
Checks if an argument is NULL or
not.
arg1 can be of the type TEXT,
DATE, NUMBER, BOOLEAN or
REFERENCE.
Observation: Because of a known
bug, resource.udfValues IS NULL
or resource.udfValues IS NOT
NULL will not work.
bp.code IS NULL
bp.code is null
bp.code IS NOT NULL
bp.code is not null
arg1 LIKE arg2
arg1 NOT LIKE arg2
arg1 ILIKE arg2
arg1 NOT ILIKE arg2
This operation allows we to check
if a text (arg1) contains some
subtext (arg2).
Both the arguments - arg1 and
arg2 - should be of type TEXT.
arg2 can contain the symbol %.
This is similar to SQL, it is a
placeholder for "zero or more
characters"
The difference between LIKE and
ILIKE is that the first one is case
sensitive and the other is not.
Suppose that bp.code='aBc', each of the expressions below is
true:
bp.code LIKE 'aBc' = true
bp.code LIKE '%B%' = true
bp.code LIKE 'ABC' = false
bp.code ILIKE 'abc' = true
bp.code ILIKE 'AbC' = true
bp.code ILIKE 'ABC' = true
bp.code ILIKE 'YXZ' = false
bp.code NOT LIKE 'aBc' = false
bp.code NOT LIKE 'ABC' = true
bp.code NOT LIKE 'xyz = true
bp.code NOT ILIKE 'aBc' = false
bp.code NOT ILIKE 'xyz' = true
arg1 IN arg2
arg1 NOT IN arg2
The semantics of the IN
operation is to check if a
REFERENCE (arg1) is contained
in some
REFERENCE_COLLECTION
(arg2).
g IN bp.groups
g in bp.groups
g NOT IN bp.groups
g not in bp.groups
arg1 IN (arg2, arg3, ..., argN)
arg1 NOT IN (arg2, arg3, ..., argN)
The semantics of the IN
operation is to check if an
argument (arg1) is contained in
some list (arg2,arg3,...,argN).
All the arguments in the list must
be of the same type as arg1:
NUMBER, TEXT, BOOLEAN, DATE
or REFERENCE.
bp.code IN('abc','xyz','1234')
bp.code in('abc','xyz','1234')
bp.code NOT IN('abc','xyz','1234','baNAna')
bp.code not in('abc','xyz','1234','baNAna')
Any()
ANY ( ) Returns a boolean value
wherever a given array column
contains the specified value
boolean.
Example Use Case
Get the information of an activity and the responsible person
linked to it (which is usually 1)
SELECT activity, person FROM Activity activity JOIN Person
person ON person.id = ANY(activity.responsibles)
Get the information of the service call and linked responsible
person which could be more than 1 person resulting in several
rows.
12/18/25, 10:49 PM
14
This is custom documentation. For more information, please visit SAP Help Portal.


Name
Description
Example
SELECT sc, person FROM ServiceCall sc, Person person WHERE
sc.code = '1' AND person.id = ANY(sc.responsibles)
Get the information of the service call and linked equipment
which could be more than 1 equipment resulting in several rows
SELECT sc.id, sc.code, sc.subject, sc.equipments, e.id, e.name,
e.serialNumber FROM ServiceCall sc, Equipment e WHERE
sc.code = '1' AND e.id = ANY(sc.equipments)
arg1 + arg2 For + operation, arg1
and arg2
can also be TEXT or DATE and
TEXT or NUMBER and TEXT
Concatenates a string with other
data types.
Example
Description
`>1 + 2 =
3`
Concatenation of numeric variables.
`>'1' + '2'
= '12'`
Concatenation of strings.
`>'1' + 2 =
'12'`
In this example, one of the values is a string `>'1'`
and the other is a number `>2`, in which case they
are concatenated as if they were both strings. This
is referred to as "implicit conversion".
Applied Use Case
The following is an example of how concatenation could be
used in a real query:
SELECT DATEPART('DAY', a.createDateTime) + '-' +
DATEPART('MONTH', a.createDateTime) + '-' +
DATEPART('YEAR', a.createDateTime) from Activity a limit 5 =>
3-11-2016 SELECT 'Create date time: ' + a.createDateTime from
Activity a limit 5 => 'Create date time: 2016-11-03 13:41:37.194'
SELECT LEFT(a.createDateTime + '', 10) from Activity a limit 5;
=> 2016-11-03
Known Limitations
In FSM database DATE type fields are stored time with milliseconds, which are not displayed in Admin portal and it’s Query Api.
When using operations <=, >= for dates, with precision in seconds, it is required to provide milliseconds rounded up, e.g.:
'SELECT ci FROM ChecklistInstance ci where ci.createDateTime <= '2024-11-14T23:12:23Z:999'
'SELECT ci FROM ChecklistInstance ci where ci.createDateTime >= '2024-11-14T23:12:23Z:001'
Regular Functions
The following functions are supported:
Name
Description
Example
LOWER(param1)
It transforms a TEXT (param1) into its
lowercase version.
LOWER('aBc')='abc'
lower('aBc')='abc'
12/18/25, 10:49 PM
15
This is custom documentation. For more information, please visit SAP Help Portal.


Name
Description
Example
UPPER(param1)
It transforms a TEXT parameter param1
into its uppercase version.
UPPER('aBc')='ABC'
upper('aBc')='ABC'
NOW()
It returns the current date and time.
bp.lastChange < now()
COALESCE(param1, param2)
Let's take an example:
COALESCE(bp.code,'xyz')
What this function does: If it sees that
bp.code is null, it will return the value
'xyz'. If bp.code is not null, it will return
the value of bp.code.
Both parameters param1 and param2
should have the same type: TEXT,
NUMBER, BOOLEAN or DATE.
If one of the parameters is a DATE and
the second is TEXT (or NUMBER), then
the TEXT (or NUMBER) parameter will
be converted to a DATE.
Let's suppose that bp.code='xyz' and bp.lastChanged is
null. Each of the expressions below is true:
```sql COALESCE(bp.code,'abc')='xyz'
coalesce(bp.code,'abc')='xyz' ``` This returns a DATE
representing 2015-01-20
coalesce(bp.lastChanged,'2015-01-20')
GETDATE(): TIMESTAMP
Alias of NOW(). It returns the current
date and time.
o.lastChange < GETDATE()
DATEPART(param1: TEXT,
param2:
TIMESTAMP|INTERVAL):
NUMBER
Extracts the specified part (*param1*) of
a timestamp (*param2*) and returns it
as NUMBER value.
Year
DATEPART('year', o.lastChange) >= 2016
Week
DATEPART('week', c.createDateTime) >= 26 (the week
number 1/52 in which the `>dateTime` occurred).
For example the following query: `>select
c.createDateTime, DATEPART('week', c.createDateTime)
from ChecklistTemplate c where c.id =
'86745B6805DD480F9C09A4FC4F9E91AB'`
would return `>26` where `>c.createDateTime` = "2017-
06-28T11:14:15Z".
DAY(param1:
TIMESTAMP|INTERVAL):
NUMBER
Alias of DATEPART('day', timestamp).
Extracts the day part of a timestamp
(*param1*) and returns it as NUMBER
value.
DAY(o.lastChange) = 1
MONTH(param1:
TIMESTAMP|INTERVAL):
NUMBER
Alias of DATEPART('month', timestamp).
Extracts the month part of a timestamp
(*param1*) and returns it as NUMBER
value.
MONTH(o.lastChange) = 1
YEAR(param1:
TIMESTAMP|INTERVAL):
NUMBER
Alias of DATEPART('year', timestamp).
Extracts the specified part of a
timestamp (*param1*) and returns it as
NUMBER value.
YEAR(o.lastChange) >= 2016
DATEADD(param1: TIMESTAMP,
param2: TEXT|INTERVAL):
TIMESTAMP
Performs calculation on the given
timestamp (*param1*) and returns a
timestamp modified by the given interval
(*param2*).
DATEADD(o.lastChange, '1 year')
12/18/25, 10:49 PM
16
This is custom documentation. For more information, please visit SAP Help Portal.


Name
Description
Example
DATEADD(param1: INTERVAL,
param2: TEXT|INTERVAL):
INTERVAL
Performs calculation on the given
interval (*param1*) and returns a
interval modified by the given interval
(*param2*).
DATEADD(o.lastChange, '1 year')
DATEINTIMEZONE(param1:
TIMESTAMP, param2: TEXT):
TIMESTAMP
The first parameter is a timestamp you
want to return in a different timezone,
the second is the timezone identifier.
Both formats are supported:
'Asia/Jakarta' or 'UTC+07:00'. (This is
done by Postgres.)
SELECT wt.startDateTime,
DATEINTIMEZONE(wt.startDateTime, 'UTC+07:00')
FROM WorkTime wt
SELECT wt.startDateTime,
DATEINTIMEZONE(wt.startDateTime, 'Asia/Jakarta')
FROM WorkTime wt
SELECT t.startDateTime,
DATEINTIMEZONE(t.startDateTime,
t.startDateTimeTimeZoneId) FROM TimeEffort t
DATEDIFF(timeUnit: ENUM,
startDateTime: TIMESTAMP,
endDateTime: TIMESTAMP):
NUMBER
Calculates difference between two
timestamps in the given time unit.
Supported time unit enums: (day, dd;
minute, mi)
DATEDIFF(day, o.startDateTime, o.endDateTime)
LEFT()
Returns the left part of a character string
with the specified number of characters.
LEFT(sc.subject, 2)
RIGHT()
Returns the right part of a character
string with the specified number of
characters.
RIGHT(sc.subject, 3)
REPLACE()
Replaces all occurrences of a specified
string value with another string value.
REPLACE(sc.subject, 'test', 'funny')
LEN() / LENGTH()
Returns the number of characters of the
specified string expression, excluding
trailing blanks.
LTRIM()
Removes the space character char(32)
or other specified characters located to
the left of the string.
RTRIM()
Removes the space character char(32)
or other specified characters located to
the right of the string.
TRIM()
Removes the space character char(32)
or other specified characters from the
start and end of the string.
REVERSE()
Returns the reverse order of a string
value.
Aggregate Functions
Those functions are similar with SQL aggregate functions.
Any field that is not part of the aggregate function parameter, must be specified into the GROUP BY clause. Any restrictions on the
aggregate function result must be specified into the HAVING clause. We support the functions below:
12/18/25, 10:49 PM
17
This is custom documentation. For more information, please visit SAP Help Portal.


Name
Description
Example
AVG(param1)
This returns the average value for param1 for all
the result tuples that match the grouping
condition.
The value of parameter param1 can be an
expression which evaluates to a NUMBER.
SELECT so.code,avg(so.potentialAmount.amount) FROM
SalesOpportunity so GROUP BY so.code
AVG( DISTINCT
param1)
This returns the average value for param1 for all
the result tuples that match the grouping
condition.
. The average value is calculated based on the
DISTINCT values of parameter param1.
The value of parameter param1 can be an
expression which evaluates to a NUMBER.
SELECT so.code,avg(distinct so.potentialAmount.amount)
FROM SalesOpportunity so GROUP BY so.code
 
COUNT(param1)
This counts the number of result tuples that
match the grouping condition. The counting take
place for non-null values of the param1.
Counting on null values of the param1 will always
return 0.
SELECT bp.code, count(bp.id) as result FROM BusinessPartner
bp GROUP BY bp.code HAVING result=1
 
COUNT( DISTINCT
param1)
This counts the number of result tuples that
match the grouping condition. The counting take
place for non-null and DISTINCT values of the
param1.
Counting on null values of the param1 will always
return 0.
SELECT bp.city, count
(distinct
bp.code) FROM BusinessPartner bp GROUP BY bp.city
COUNT(*)
This counts the number of result tuples that
match the grouping condition.
SELECT bp.city, count(*) FROM BusinessPartner bp GROUP
BY bp.city HAVING count(*) > 4 ORDER BY count(*) DESC
MAX(param1)
This gets the maximum value of the parameter
param1 by inspecting all the result tuples that
match the grouping condition.
The value of parameter param1 can be an
expression which evaluates to a: NUMBER, TEXT
or DATE.
SELECT e.item, max(e.name) FROM Equipment e GROUP BY
e.item
MIN(param1)
This gets the minimum value of the parameter
param1 by inspecting all the result tuples that
match the grouping condition.
The value of parameter param1 can be an
expression which evaluates to a: NUMBER, TEXT
or DATE.
SELECT e.item, min(e.name) FROM Equipment e GROUP BY
e.item
SUM(param1)
This returns the sum for all the values of the
parameter param1 by inspecting all the result
tuples that match the grouping condition.
The value of parameter param1 can be an
expression which evaluates to a NUMBER.
SELECT sum(so.potentialAmount.amount) FROM
SalesOpportunity so
12/18/25, 10:49 PM
18
This is custom documentation. For more information, please visit SAP Help Portal.


Name
Description
Example
SUM
( DISTINCT
param1)
This returns the sum for all the DISTINCT values
of the parameter param1 by inspecting all the
result tuples that match the grouping condition.
The value of parameter param1 can be an
expression which evaluates to a NUMBER.
SELECT sum(distinct so.potentialAmount.amount) FROM
SalesOpportunity so
Expression Alias
You can define expressions in the SELECT clause by using aliases. Later, you can use those aliases into WHERE, HAVING and
ORDER BY clauses. Let’s take an example:
In this example we use two aliases: sumPlusOne (for the expression sum(so.potentialAmount.amount) + 1) and
lowerCurrencyWithSuffix (for the expression LOWER(so.potentialAmount.currency) + '_sufix').
Alias Expression in GROUP BY Clause
What Doesn’t Work
Please note that Alias in the GROUP BY clause is NOT supported. This means that the following query does NOT work:
What Will Work
SELECT so.code, 
       Sum(so.potentialamount.amount), 
       Sum(so.potentialamount.amount) + 1 AS sumPlusOne, 
       Lower(so.potentialamount.currency) 
       + '_suffix'                        AS lowerCurrencyWithSuffix 
FROM   salesopportunity so 
WHERE  lowercurrencywithsuffix = 'chf_suffix' 
GROUP  BY so.code, 
          so.potentialamount.currency 
HAVING sumplusone > 10 
ORDER  BY sumplusone DESC 
LIMIT  2 
 Warning
Do not use reserved words as aliases!
For example you can NOT use:
Names of the functions: sum, lower, max…
Operations names: and, or, in…
Names of SQL clauses: select, from, where, on…
SELECT   p.firstname + ’ ’ + p.lastname AS fullname, 
         count(sa.id) 
FROM     person p 
JOIN     serviceassignment sa 
ON       sa.technician = p.id 
GROUP BY fullname
12/18/25, 10:49 PM
19
This is custom documentation. For more information, please visit SAP Help Portal.


While the following query DOES WORK:
Additionally, although Alias in a GROUP BY clause isn’t supported, GROUP BY CAN be used for UDF fields (example:
udfObject.udfField) which may represent aliases. This is achieved by using a subselect query as demonstrated below:
UNION
The UNION operator to join two or more queries together.
For example:
An individual query from the composite UNION query can contain anything, as well as subqueries. Individual queries need to
contain same number of columns.
Usage
When making the call via Query API and using composite UNION queries, you only need to provide DTOs for the first
individual query tables.
UNION queries only return distinct non-repeating results in no order followed by ids from BusinessPartner table, which
will be returned in order.- ORDER BY is only possible on the composite query in case of a UNION query, the ORDER BY in the
example query will sort ids from Activity as well.
LIKE / ILIKE
SELECT   p.firstName + ' ' + p.lastName AS fullname,
         count(sa.id)
FROM     Person p
JOIN     ServiceAssignment sa
ON       sa.technician = p.id
GROUP BY p.firstName,
         p.lastName 
 Attention
Arrays (for example UDFs) cannot be addressed with a GROUP BY clause.
 Note
Please note that in the following example, example_field is the UDF field name and ZC is the alias.
SELECT tbl.zc,
       Count(tbl.zc)
FROM   (SELECT COALESCE(sc.udf.example_field, '') AS ZC
        FROM   servicecall sc) tbl
GROUP  BY tbl.zc 
SELECT a.id AS id
FROM Activity a
UNION
SELECT bp.id AS id
FROM BusinessPartner bp,
    (SELECT a.businessPartner as bpId
     FROM Activity a
     WHERE a.subject = 'CANCELLED - atew')
        subQueryAct WHERE bp.id = subQueryAct.bpId
12/18/25, 10:49 PM
20
This is custom documentation. For more information, please visit SAP Help Portal.


A LIKE query could be used to query for items that have vendors or bar codes which contain a certain string. This could be used to
filter the list of items for specific properties:
GREATEST / LEAST
The GREATEST function can be used to return the largest argument in a query, while the LEAST function can be used to return the
smallest argument.
ANY Operator
The ANY operator are used with a WHERE clause.
The ANY operator returns true if any of the subquery values meet the condition.
Example
Example
OFFSET and/or LIMIT
Attention: Due to memory issues and latencies, OFFSET / LIMIT is NOT supported in the Query API. It is recommended to use
the Analytics & Reporting app to determine the number of records returned in a query.
Sometimes we don’t want to get all the results, but only some of them: a page. If the result set is a large one, it is also
recommended not to get all the results at once.
For getting only a page we have two options: pagination or OFFSET and/or LIMIT. We cannot use pagination combined with
OFFSET and/or LIMIT.
SELECT a 
FROM   activity a 
WHERE  a.responsibles ilike ‘%60a745386c71444b96b29fbccfc46c39%’ limit 1;SELECT a 
FROM   activity a 
WHERE  a.responsibles LIKE ‘%60a745386c71444b96b29fbccfc46c39%’ limit 1;SELECT i 
FROM   item i 
WHERE  i.eans LIKE ‘%9440012400%’ limit 1;SELECT f 
FROM   function f 
WHERE  f.parameterTypes ilike ‘%numb%’ limit 1 ;
SELECT t.startDateTime, 
       t.endDateTime, 
       Greatest(t.startDateTime, t.endDateTime), 
       Least(t.startDateTime, t.endDateTime) 
FROM   TimeEffort t 
LIMIT  3; 
SELECT a FROM UdfMetaGroup a WHERE 'DFC901E37749424F94CF0AE781492EC2' = ANY(a.udfMetas)
SELECT a FROM Activity a WHERE '62BF1F263A84444D952B41AFFC355BEF' = ANY(a.responsibles)
SELECT activity, person FROM Activity activity JOIN Person person ON person.id = ANY(activity.respo
SELECT item FROM Item item WHERE '8DF8EEF870664180B4C1178205133C43' = ANY(item.vendors);
SELECT item FROM Item item WHERE '73513537' = ANY(item.eans);
12/18/25, 10:49 PM
21
This is custom documentation. For more information, please visit SAP Help Portal.


OFFSET and LIMIT is discussed here.
Note that the OFFSET and LIMIT are placed at the end of the query!
Second, we are not forced to use both at the same time. But if we want to use both, the order should be respected: first
OFFSET then LIMIT.
For understanding OFFSET and LIMIT, we will take the next example:
Suppose this query returns 1,000,000 Activities (actually 1,000,000 pairs. In this case a pair has only one resource: an Activity).
Because there are too many results, we are interested only in displaying 100 results (this is LIMIT), starting from the position 500
(this is OFFSET) in the result set.
For doing this, we will use:
User-defined Fields (UDFs)
There is a conceptual difference between a system (“real”) property (like a Business Partner’s name) and a user-defined field
(“virtual”) property (like SWA_PI_EBill).
As an example, let’s try this query:
In the results, the UDFs are displayed in a list (udfValues).
A UDF contains three elements:
UDF Meta
UDF Value
UDF Name.
So what is the type of this UDF? There is more information that we can get related to a UDF, but it is not stored in the resource
itself (Business Partner , in this case). It is stored in a special resource: UdfMeta.
The connection between this UDF value (stored in Business Partner) and the corresponding UdfMeta resource is made by the
meta field. (“meta”: “84D08597D70A4109894CB7501B6081B1”).
Let’s take a look to the UdfMeta of this virtual field: SWA_PI_EBill.
SELECT a.id
FROM   Activity a OFFSET 5 LIMIT 3
SELECT a.id
FROM   Activity a OFFSET 5
SELECT a.id
FROM   Activity a LIMIT 3
SELECT a.id FROM Activity a
SELECT a.id 
FROM   Activity a offset 500 limit 100
SELECT bp.name, bp.udf.SWA_PI_EBill FROM BusinessPartner bp LIMIT 1
12/18/25, 10:49 PM
22
This is custom documentation. For more information, please visit SAP Help Portal.


And finally, we managed to find the type of the UDF in the example: SELECTIONLIST.
Therefore, there is a bit more information to consider when working with UDFs. They can be added to a resource type, but later
removed. Imagine that today we create a new UDF and link it to the BusinessPartner resource type.
Suppose then we use this UDF for different reports. After 2 weeks, it gets removed from the system.
The question arises: What happens to those reports that use the undefined UDFs?
If this UDF is used only in SELECT clauses, it is simply ignored. It will not be included in the udfValues list.
If this UDF is used in any WHERE, JOIN or ORDER BY clauses however, then no assumptions are made about the undefined
UDF when evaluating the expressions. For such cases, the error is exposed and the responsibility is passed to the API user.
We will get this error:
When constructing the error handling is advisable to be careful: in the future the error messages can change, but not the error
codes (CA-152)! Building the error handling based on error codes is highly advisable).
An UDF can have the same name as a system field. For example:
Because of this, a special construct is used to make the difference: A UDF can be queried by using the syntax:
resource.udf.name (for example: bp.udf.SWA_PI_EBill).
There are also other ways to access a UDF. The following queries are equivalent:
SELECT um FROM UdfMeta um WHERE um.id='84D08597D70A4109894CB7501B6081B1'
{
   "error": "CA-152",
   "message": "There is no Udf [{0}] in UdfMeta associated with the resource [{1}].",
   "values": [
      "bp.udf.SWA_PI_EBill",
      "bp"
   ]
}
{
   "data": [
      {
         "bp": {
            "code": "K20071", // system field into Business Partner
            "udfValues": [
               {
                  "meta": "84D08597D70A4109894CB7501B6081B1",
                  "value": "N",
                  "name": "code" //an UDF with the same name as the real field
               }
            ]
         }
      }
   ]
}
//get BY udf NAMESELECT bp.udf.ccemail 
FROM   businesspartner bp 
WHERE  bp.udf.ccemail='csstext@email.ch;ovidiu@email.ch' 
//BY using a FUNCTIONSELECT Getudfbyname(bp,'CcEmail') 
FROM   businesspartner bp 
WHERE  Getudfbyname(bp,'CcEmail')='csstext@email.ch;ovidiu@email.ch' 
//get by udf metaSELECT Getudfbymeta(bp,'58186B814E8C41FAAA74D303C809C633') 
FROM   businesspartner bp 
WHERE  Getudfbymeta(bp,'58186B814E8C41FAAA74D303C809C633')='csstext@email.ch;ovidiu@email.ch'
12/18/25, 10:49 PM
23
This is custom documentation. For more information, please visit SAP Help Portal.


The output will be:
Using Custom Objects / Fields
The following is an example of a custom object/field referenced in a query.
Custom Objects and Fields are created and defined in Admin > Company > Custom Objects.
Output Formats
We support two output formats:
Object (default)
Tabular
To select the output format, you may have to use the optional parameter: outputFormat(having the values: object or tabular).
In the output result, the resources are grouped in tuples:
Output
{
   "data": [
      {
         "bp": {
            "udfValues": [
               {
                  "meta": "58186B814E8C41FAAA74D303C809C633",
                  "value": "csstext@email.ch;ovidiu@email.ch",
                  "name": "CcEmail"
               }
            ]
         }
      }
   ]
}
SELECT locationHistoryDefinition.NAME, 
       locationHistoryDefinition.description, 
       locationHistory.createdatetime, 
       locationHistory.createperson, 
       locationHistory.udf.code, 
       locationHistory.udf.datetime, 
       locationHistory.udf.technician, 
       locationHistory.udf.equipment, 
       locationHistory.udf.latitude, 
       locationHistory.udf.longitude 
FROM   udovalue locationHistory 
       JOIN udometa locationHistoryDefinition 
         ON locationHistoryDefinition.id = locationHistory.meta 
WHERE  locationHistoryDefinition.NAME = ‘locationhistory’;
 //start of tuple1
{ resource1, resource2, resource3 }, //end of tuple1 
//start of tuple2 
{ resource1, resource2, resource3 }, 
//end of tuple2 
//start of tuple3 
12/18/25, 10:49 PM
24
This is custom documentation. For more information, please visit SAP Help Portal.


The differences between those two formats is made in the way the resource fields are structured.
Lets run the query below and see have a closer look at the differences between the two output formats:
Object Output Format
The results in object format would appear as follows:
{ resource1, resource2, resource3 }, 
//end of tuple3 
SELECT bp.id, 
       bp.code, 
       bp.syncobjectkpis, 
       sc.id, 
       sc.responsibles, 
       sc.technicians 
FROM   businesspartner bp 
       JOIN servicecall sc 
         ON bp = sc.businesspartner 
LIMIT  1 
{
  "data": [
    {
      "bp": {
        "syncObjectKPIs": [
          {
            "additionalInformation": "CHF",
            "cloudDataType": "MONETARYAMOUNT",
            "description": "CurrentAccountBalance",
            "value": "498088.55"
          },
          {
            "additionalInformation": "CHF",
            "cloudDataType": "MONETARYAMOUNT",
            "description": "OpenDeliveryNotesBalance",
            "value": "1185.82"
          },
          {
            "additionalInformation": "CHF",
            "cloudDataType": "MONETARYAMOUNT",
            "description": "OpenOrdersBalance",
            "value": "7641.82"
          },
          {
            "additionalInformation": "",
            "cloudDataType": "INT",
            "description": "OpenOpportunities",
            "value": "6"
          }
        ],
        "code": "C20000",
        "id": "FB12073892264DAF8250D6149A1AAD13"
      },
      "sc": {
        "technicians": [],
        "responsibles": [
          "3080357EE48A48CBA233CFE86BB99237"
        ],
        "id": "DA756599ABE440CBA07DC8A11EC5F4A5"
      }
    }
  ]
}
12/18/25, 10:49 PM
25
This is custom documentation. For more information, please visit SAP Help Portal.


Tabular Output Format
The same result in tabular format would appear as follows:
Additional Examples
The following are additional example queries that are supported by the Query API:
Get all the fields from all Business Partners
Get only the fields ID, country, type, UDF Value from all Business Partners
Get only the fields id, and SWA_PI_EBill (this is a UDF) from all Business Partners
Join all Business Partners and their Service Calls. Pairs (Business Partner, Service Call):
Join all Business Partners and their Activities. Pairs (Business Partner, Activity)
{
  "data": [
    {
      "bp.syncObjectKPIs[0].additionalInformation": "CHF",
      "bp.syncObjectKPIs[0].cloudDataType": "MONETARYAMOUNT",
      "bp.syncObjectKPIs[0].description": "OpenDeliveryNotesBalance",
      "bp.syncObjectKPIs[0].value": "1185.82",
      "bp.syncObjectKPIs[1].additionalInformation": "CHF",
      "bp.syncObjectKPIs[1].cloudDataType": "MONETARYAMOUNT",
      "bp.syncObjectKPIs[1].description": "OpenOrdersBalance",
      "bp.syncObjectKPIs[1].value": "7641.82",
      "bp.syncObjectKPIs[2].additionalInformation": "",
      "bp.syncObjectKPIs[2].cloudDataType": "INT",
      "bp.syncObjectKPIs[2].description": "OpenOpportunities",
      "bp.syncObjectKPIs[2].value": "6",
      "bp.syncObjectKPIs[3].additionalInformation": "CHF",
      "bp.syncObjectKPIs[3].cloudDataType": "MONETARYAMOUNT",
      "bp.syncObjectKPIs[3].description": "CurrentAccountBalance",
      "bp.syncObjectKPIs[3].value": "498088.55",
      "bp.code": "C20000",
      "bp.id": "FB12073892264DAF8250D6149A1AAD13",
      "sc.technicians": "[]",
      "sc.responsibles[0]": "3080357EE48A48CBA233CFE86BB99237",
      "sc.id": "DA756599ABE440CBA07DC8A11EC5F4A5"
    }
  ]
}
SELECT bp 
FROM   businesspartner bp 
SELECT bp.id, bp.country, bp.type, bp.udfValues FROM BusinessPartner bp
SELECT bp.id, bp.udf.SWA_PI_EBill FROM BusinessPartner bp
SELECT bp, sc FROM BusinessPartner bp JOIN ServiceCall sc ON bp=sc.businessPartner
SELECT bp, sc FROM BusinessPartner bp JOIN ServiceCall sc ON bp.id=sc.businessPartner  // we use th
12/18/25, 10:49 PM
26
This is custom documentation. For more information, please visit SAP Help Portal.


Get only the Business Partners with the currency ‘EUR’
Get only the Business Partners (fields: id and name) with the ID from a list of texts (representing identifiers):
Get only the Business Partners (fields: id and lastChanged) with the lastChanged equal to 1429794685185 or 1429794686369
timestamps
Get only the Business Partners (fields: id and lastChanged) with the lastChanged lower than 2016-02-29T09:07:12Z
Filter Out Old Statuses Using a Subquery
Note: the following example is a subquery that refers to multiple tables.
SELECT bp, a FROM BusinessPartner bp JOIN Activity a ON bp=a.object
SELECT bp, a FROM BusinessPartner bp JOIN Activity a ON bp.id=a.object.objectId // here we use the 
SELECT bp FROM BusinessPartner bp WHERE bp.creditLimit.currency='EUR'
SELECT bp.id,bp.name FROM BusinessPartner bp WHERE bp IN ('D5C32244D7AC4F0380EDEC002E59447F','40EE5
SELECT bp.id,bp.name FROM BusinessPartner bp WHERE bp.id IN ('D5C32244D7AC4F0380EDEC002E59447F','40
SELECT bp.id, bp.lastChanged FROM BusinessPartner bp WHERE bp.lastChanged IN (1429794685185, 142979
//or
SELECT bp.id, bp.lastChanged FROM BusinessPartner bp WHERE bp.lastChanged=1429794685185 or bp.lastC
//or using the format yyyy-MM-ddThh:mm:ssZ
SELECT bp.id, bp.lastChanged FROM BusinessPartner bp WHERE bp.lastChanged<'2016-02-29T09:07:12Z'
//or using the format yyyy-MM-dd
SELECT bp.id, bp.lastChanged FROM BusinessPartner bp WHERE bp.lastChanged<'2016-02-29'
//or using the format yyyyMMdd
SELECT bp.id, bp.lastChanged FROM BusinessPartner bp WHERE bp.lastChanged<'20160229'
SELECT a.id, sas.name 
FROM Activity a, ServiceAssignmentStatus sas,
(SELECT s.object.objectId AS objectId, MAX(s.createDateTime) AS maxcdt FROM ServiceAssignmentStatus
WHERE a.id = sas.object.objectId
AND sas2.objectId = a.id
AND sas.createDateTime = sas2.maxcdt
12/18/25, 10:49 PM
27
This is custom documentation. For more information, please visit SAP Help Portal.


