const getComments = (articleId, limit, offset) => `WITH main_cte AS 
(SELECT * FROM "Users" usrt LEFT JOIN 
(SELECT * FROM "Comments" ct1 LEFT JOIN 
(SELECT "parentId" "pId", count(*) "repliesCount" FROM 
  "Comments" GROUP BY "parentId") ct2 ON ct2."pId" = ct1.id 
  WHERE ct1.type = 'main' AND ct1."articleId" = ANY('{${articleId}}'))
   ctf ON ctf."authorId" = usrt.id ORDER BY ctf."createdAt"), 
   count_cte AS (SELECT count(*) AS "totalCount" FROM main_cte) 
   SELECT * FROM main_cte, count_cte LIMIT ${limit} OFFSET ${offset};`;

const getReplies = (articleId, parentId, limit, offset) => `WITH main_cte AS 
(SELECT * FROM "Users" usrt LEFT JOIN 
(SELECT * FROM "Comments"ct1 LEFT JOIN 
(SELECT "parentId" "pId", count(*) "repliesCount" FROM 
"Comments" GROUP BY "parentId") ct2 ON ct2."pId" = ct1.id 
WHERE ct1.type = 'reply' AND ct1."articleId" = ANY('{${articleId}}') 
AND ct1."parentId" = ${parentId})
 ctf ON ctf."authorId" = usrt.id ORDER BY ctf."createdAt"), 
 count_cte AS (SELECT count(*) AS "totalCount" FROM main_cte) 
 SELECT * FROM main_cte, count_cte LIMIT ${limit} OFFSET ${offset};`;

const getComment = commentId => `SELECT * FROM "Users" u JOIN (SELECT * 
  FROM "Comments" c1 JOIN 
(SELECT "parentId" AS "parentId", count(*) AS "repliesCount" 
FROM "Comments" GROUP BY "parentId") c2 ON c1.id = c2."parentId" 
WHERE c1.id = ${commentId}) cf ON u.id = cf."authorId";`;

export default {
  getComments,
  getReplies,
  getComment,
};
