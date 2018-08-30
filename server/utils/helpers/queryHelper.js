// query the database to get comments and total comments of an article,
// including the owner and reply count of each comment
const getComments = (articleId, limit, offset) => `WITH 
main_commenttable AS (SELECT * FROM "Users" userstable LEFT JOIN 
(SELECT * FROM "Comments" commenttable1 LEFT JOIN 
(SELECT "parentId" "parentid", count(*) "repliesCount" FROM 
  "Comments" GROUP BY "parentId") commenttable2 ON 
  commenttable2."parentid" = commenttable1.id 
  WHERE commenttable1.type = 'main' AND 
  commenttable1."articleId" = ANY('{${articleId}}'))
   commenttablefinal ON commenttablefinal."authorId" = 
   userstable.id ORDER BY commenttablefinal."createdAt"), 
   count_comments AS (SELECT count(*) AS "totalCount" FROM main_commenttable) 
   SELECT * FROM main_commenttable, 
   count_comments LIMIT ${limit} OFFSET ${offset};`;

// query the database to get replies and total replies of a comment,
// including the owner and reply count of each reply
const getReplies = (articleId, parentId, limit, offset) => `WITH 
main_commenttable AS (SELECT * FROM "Users" userstable LEFT JOIN 
(SELECT * FROM "Comments" commenttable1 LEFT JOIN 
(SELECT "parentId" "parentid", count(*) "repliesCount" FROM 
"Comments" GROUP BY "parentId") commenttable2 ON 
commenttable2."parentid" = commenttable1.id 
WHERE commenttable1.type = 'reply' AND 
commenttable1."articleId" = ANY('{${articleId}}') 
AND commenttable1."parentId" = ANY('{${parentId}}'))
 commenttablefinal ON commenttablefinal."authorId" = 
 userstable.id ORDER BY commenttablefinal."createdAt"), 
 count_comments AS (SELECT count(*) AS "totalCount" FROM main_commenttable) 
 SELECT * FROM main_commenttable, 
 count_comments LIMIT ${limit} OFFSET ${offset};`;

// get a single comment, including the owner and reply count of the comment
const getComment = commentId => `SELECT * FROM "Users" 
userstable JOIN (SELECT * FROM "Comments" commenttable1 JOIN 
(SELECT "parentId" AS "parentId", count(*) AS "repliesCount" 
FROM "Comments" GROUP BY "parentId") commenttable2 ON 
commenttable1.id = commenttable2."parentId" 
WHERE commenttable1.id = ANY('{${commentId}}')) 
cf ON userstable.id = cf."authorId";`;

export default {
  getComments,
  getReplies,
  getComment,
};
