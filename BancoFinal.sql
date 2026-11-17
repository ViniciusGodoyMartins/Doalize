CREATE DATABASE  IF NOT EXISTS `doalize` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `doalize`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: doalize
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chats`
--

DROP TABLE IF EXISTS `chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_one_id` int(11) NOT NULL,
  `user_two_id` int(11) NOT NULL,
  `last_message` text DEFAULT NULL,
  `last_message_time` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_one_id` (`user_one_id`),
  KEY `user_two_id` (`user_two_id`),
  CONSTRAINT `chats_ibfk_1` FOREIGN KEY (`user_one_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `chats_ibfk_2` FOREIGN KEY (`user_two_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chats`
--

LOCK TABLES `chats` WRITE;
/*!40000 ALTER TABLE `chats` DISABLE KEYS */;
/*!40000 ALTER TABLE `chats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_change_verifications`
--

DROP TABLE IF EXISTS `email_change_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_change_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `new_email` varchar(160) NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `email_change_verifications_user_id_index` (`user_id`),
  KEY `email_change_verifications_new_email_index` (`new_email`),
  KEY `email_change_verifications_user_used_index` (`user_id`,`used`),
  KEY `email_change_verifications_expires_at_index` (`expires_at`),
  CONSTRAINT `email_change_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_change_verifications`
--

LOCK TABLES `email_change_verifications` WRITE;
/*!40000 ALTER TABLE `email_change_verifications` DISABLE KEYS */;
INSERT INTO `email_change_verifications` VALUES (1,3,'vinisaomtec@gmail.com','$2b$10$tFDbdjJnWumTnkpjoIxr1.3EvgySrTwP7ENcdSDp565V6T6Ks4xwS','2026-09-14 12:29:04',0,0,'2026-09-14 12:19:04');
/*!40000 ALTER TABLE `email_change_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  `audio` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,3,1,'Oi',NULL,NULL,'2026-05-26 14:10:55'),(2,3,2,'Ola',NULL,NULL,'2026-05-26 14:13:43'),(3,3,1,'Gallo melhor professor',NULL,NULL,'2026-05-26 14:22:18'),(4,3,3,'Ola',NULL,NULL,'2026-06-16 13:19:11'),(5,3,3,'Anotacoes',NULL,NULL,'2026-08-14 14:23:44'),(6,5,3,'Eu conheco um bom limpador de piscina, quer o numero?',NULL,NULL,'2026-08-26 16:57:38'),(7,5,3,'teste',NULL,NULL,'2026-08-26 17:17:06'),(8,5,3,'ola',NULL,NULL,'2026-08-26 17:17:18'),(9,5,3,'testando',NULL,NULL,'2026-08-26 17:17:24'),(10,5,3,'ola',NULL,NULL,'2026-08-26 17:18:05'),(11,3,1,'Oi Gallo',NULL,NULL,'2026-09-14 12:31:47'),(12,8,7,'Boa dia meu jovem, podemos fazer uma troca ? Tenho alguns chinelos e tenis do meu neto sobrando para doar, e estou precisando de algumas roupas de cama, vc teria pra poder fazer uma troca ?',NULL,NULL,'2026-11-06 13:08:52'),(13,10,9,'Ola boa dia, tenho um computador antigo para doar, teria interesse nele para seus estudos ?',NULL,NULL,'2026-11-06 13:22:56'),(14,9,10,'OI, tenho interesse sim',NULL,NULL,'2026-11-17 14:30:28'),(15,9,10,'Seria muito importante pra mim, iria ajudar muito',NULL,NULL,'2026-11-17 14:30:53'),(16,9,10,'Quando posso dar um pulo ai pegar?',NULL,NULL,'2026-11-17 14:31:26'),(17,10,9,'Maravliha, pode deixar que eu levo pra voce',NULL,NULL,'2026-11-17 14:34:57'),(18,10,9,'Depois me manda seu endereco',NULL,NULL,'2026-11-17 14:35:22'),(19,3,10,'Ola',NULL,NULL,'2026-11-17 14:36:36'),(20,3,10,'Tenho interesse no computador',NULL,NULL,'2026-11-17 14:36:48'),(21,3,10,'Iria ajudar muito minha filha',NULL,NULL,'2026-11-17 14:37:05'),(22,3,10,'Se for possivel doar ele para mim eu agradeco',NULL,NULL,'2026-11-17 14:37:26'),(23,3,2,'Muito obrigado',NULL,NULL,'2026-11-17 14:38:20'),(24,10,3,'OI, infelizmente ja doei ele',NULL,NULL,'2026-11-17 14:39:21');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_verifications`
--

DROP TABLE IF EXISTS `password_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `password_verifications_user_id_index` (`user_id`),
  KEY `password_verifications_user_used_index` (`user_id`,`used`),
  KEY `password_verifications_created_at_index` (`created_at`),
  CONSTRAINT `password_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_verifications`
--

LOCK TABLES `password_verifications` WRITE;
/*!40000 ALTER TABLE `password_verifications` DISABLE KEYS */;
INSERT INTO `password_verifications` VALUES (6,5,'$2b$10$Iv9xL5zM3zovGRJ.qNc/M.NX.sQDeOsAdX5EYua6RD.DyJ5iasnwO','2026-08-26 17:08:30',0,1,'2026-08-26 16:58:30'),(7,3,'$2b$10$.TmntLvFAi26iKJM0s.NZurjSV2/rJcqMSYA9AuBzxKscviO.Gg9G','2026-09-14 12:15:34',0,1,'2026-09-14 12:05:34');
/*!40000 ALTER TABLE `password_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_promotions`
--

DROP TABLE IF EXISTS `post_promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_promotions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `post_promotions_post_user_unique` (`post_id`,`user_id`),
  KEY `post_promotions_post_id_index` (`post_id`),
  KEY `post_promotions_user_id_index` (`user_id`),
  CONSTRAINT `post_promotions_ibfk_27` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `post_promotions_ibfk_28` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_promotions`
--

LOCK TABLES `post_promotions` WRITE;
/*!40000 ALTER TABLE `post_promotions` DISABLE KEYS */;
INSERT INTO `post_promotions` VALUES (7,19,10,'2026-11-17 14:29:42'),(9,19,3,'2026-11-17 14:50:08'),(10,28,3,'2026-11-17 14:50:30'),(11,27,3,'2026-11-17 14:50:43');
/*!40000 ALTER TABLE `post_promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `promoted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `summary` varchar(160) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (12,6,'Estou passando por um período de dificuldades financeiras e alguns cômodos da minha casa ainda estão sem os móveis e utensílios necessários. Estou tentando melhorar meu espaço aos poucos, mas não consigo comprar tudo neste momento. Se alguém tiver algum item doméstico em bom estado que não esteja mais utilizando, ficarei muito agradecida pela ajuda.','[\"/uploads/posts/1793967480541-ce36ca761469cfde1d302e0c4fc4d1ff.png\",\"/uploads/posts/1793967507817-b2f26e9eccca398919cd74db210fa89e.png\",\"/uploads/posts/1793967531342-7116db3094278dc60a14252f8e3818fa.jpg\",\"/uploads/posts/1793967533242-5a74185b6d0f613958f9c6912486061f.jpg\"]',0,'2026-11-06 12:18:55','Preciso de ajuda para organizar minha casa'),(13,6,'Estou precisando de um colchão para conseguir organizar melhor meu quarto e ter um local adequado para descansar. Comprar um novo está difícil neste momento, então um colchão usado, mas em boas condições, já faria uma grande diferença. Agradeço muito a quem puder ajudar.','[\"/uploads/posts/1793967936785-068110f44750c48951913f46a9733f39.png\",\"/uploads/posts/1793967963201-a4111a17cdc1fd739ef8860c0613f248.png\",\"/uploads/posts/1793967987067-3e182d53d36d42e232acfe9c19fd32d1.png\"]',0,'2026-11-06 12:26:52','Estou precisando de um colchão em bom estado para minha casa.'),(14,7,'Tenho algumas roupas masculinas que estão guardadas e não utilizo mais. Todas estão em condições de uso e gostaria de destiná-las a alguém que esteja precisando. São camisetas, camisas e algumas calças. Espero que possam ser úteis para outra pessoa.','[\"/uploads/posts/1793968351111-6bf79bd552aa32c834b158ec1f5bd309.png\",\"/uploads/posts/1793968382251-ad5648f06b2908e966d06e4b6c53ca03.png\"]',0,'2026-11-06 12:33:32','Estou doando algumas roupas masculinas que não utilizo mais e estão em bom estado.'),(15,7,'Estou organizando uma ação de doação e gostaria de conseguir alguns calçados usados em boas condições. Tênis, sapatos e sandálias podem fazer diferença para quem está precisando. Se você tiver algum par que não utiliza mais, poderá ajudar bastante alguém da comunidade.','[\"/uploads/posts/1793968536057-66916b885237070d5b8cfa41a714cb25.png\"]',0,'2026-11-06 12:36:07','Estou procurando calçados usados em bom estado para ajudar quem precisa.'),(16,8,'Estou precisando de alguns cobertores, lençóis e fronhas para melhorar as condições da minha casa. Os dias mais frios estão chegando e esses itens fazem bastante falta. Se alguém tiver peças em bom estado que não utiliza mais, agradeço muito pela ajuda.','[\"/uploads/posts/1793970286692-64c8c5c253481c857a63a0c058c492d4.png\"]',0,'2026-11-06 13:05:13','Estou precisando de cobertores e roupas de cama para minha casa.'),(17,9,'Estou precisando de alguns materiais escolares para conseguir acompanhar melhor as atividades e os estudos. No momento, não consigo comprar todos os itens necessários. Cadernos, lápis, canetas, borrachas e outros materiais em bom estado já ajudariam bastante. Toda contribuição será muito bem-vinda.','[\"/uploads/posts/1793970799835-0a8a5d6c9a9aea44b7f4cbabc6212a59.png\"]',0,'2026-11-06 13:13:48','Estou precisando de materiais escolares para continuar meus estudos.'),(18,9,'Estou procurando um celular usado que funcione adequadamente para conseguir acompanhar atividades escolares, acessar materiais de estudo e realizar pesquisas. No momento, não tenho condições de comprar um aparelho novo. Um celular simples, mesmo que seja de um modelo antigo, já ajudaria bastante.','[\"/uploads/posts/1793970866630-3f5cdf99ef665303161f8d2b739ec824.png\",\"/uploads/posts/1793970891173-53df9aeed9d6a42a6a5cf2e739bbbbf2.png\"]',0,'2026-11-06 13:15:17','Estou precisando de um celular usado para ajudar nos meus estudos.'),(19,10,'Tenho um computador antigo que não utilizo mais e gostaria de doar para alguém que esteja precisando. O equipamento apresenta sinais de uso, mas pode ser aproveitado para atividades básicas, dependendo de sua condição de funcionamento. Quero que ele tenha uma nova utilidade em vez de ficar guardado.','[\"/uploads/posts/1793971240486-31b8117245e87c61b333b1abd2effb05.png\"]',1,'2026-11-06 13:21:05','Estou doando um computador antigo que pode ser útil para alguém.'),(20,11,'Estou tentando organizar minha casa e preciso de alguns móveis básicos para deixar os ambientes mais funcionais. No momento, não tenho condições de comprar tudo novo, então móveis usados em bom estado já fariam uma grande diferença. Se alguém tiver uma mesa, cadeiras ou sofá que não utiliza mais, ficarei muito agradecido.','[\"/uploads/posts/1793971842761-4cabfe9647c19da90bcf7d2d2dd035dd.png\",\"/uploads/posts/1793971867859-2214aac0497010fd9d5f951336e7cb1a.png\"]',0,'2026-11-06 13:31:30','Estou procurando móveis usados em bom estado para minha casa.'),(21,11,'Tenho uma estante que não utilizo mais e gostaria de doar para alguém que esteja precisando de um móvel para organizar livros, objetos ou outros pertences. Ela apresenta sinais normais de uso, mas continua em boas condições. Espero que possa ser útil para outra pessoa.','[\"/uploads/posts/1793972006806-17d3792728e2c607fbb7ad677aa5d0b9.png\"]',0,'2026-11-06 13:33:52','Estou doando uma estante usada que ainda está em boas condições.'),(22,12,'Tenho algumas ferramentas guardadas que estão funcionando e podem ser úteis para outra pessoa. São ferramentas básicas, como martelo, alicates e chaves de diferentes tipos. Gostaria de destiná-las a alguém que esteja precisando para pequenos reparos ou trabalhos domésticos.','[\"/uploads/posts/1793972535343-aed1b09145cce6b4a1a95255561910e7.png\"]',0,'2026-11-06 13:42:46','Estou doando algumas ferramentas que não utilizo mais.'),(23,13,'Com a chegada dos dias mais frios, estou precisando de algumas roupas de inverno. No momento, tenho poucas peças adequadas para essa época. Casacos, blusas de frio e moletons usados em bom estado seriam de grande ajuda. Agradeço a todos que puderem contribuir.','[\"/uploads/posts/1793972877249-b7a73c740cea5b4adf4669fab5e3626b.png\",\"/uploads/posts/1793972913692-fb2ccc11d76143f72ef71b3959eada9e.png\"]',0,'2026-11-06 13:49:00','Estou precisando de roupas de inverno para enfrentar os dias mais frios.'),(24,13,'Estou tentando organizar minha cozinha e preciso de alguns utensílios básicos para preparar as refeições do dia a dia. No momento, faltam panelas, pratos, copos e talheres. Qualquer item usado em boas condições já será de grande ajuda. Agradeço muito a quem puder contribuir.','[\"/uploads/posts/1793973073159-94ec9d41ffdf7431b72d61eea35694a5.png\",\"/uploads/posts/1793973099078-8792241b0cd318a5c6939e09103b9404.png\",\"/uploads/posts/1793973123644-6c81ee488a100abf60951fcc5df46a06.png\"]',0,'2026-11-06 13:52:31','Estou precisando de utensílios básicos para conseguir organizar minha cozinha.'),(25,14,'Consegui reunir alguns alimentos que gostaria de compartilhar com pessoas que estejam passando por dificuldades. São produtos básicos, todos em boas condições e dentro do prazo de validade. Espero que possam ajudar alguém a complementar as compras de casa.','[\"/uploads/posts/1793973620140-e44e44aba52d815c34d04fe3c80b263f.png\"]',0,'2026-11-06 14:00:47','Tenho alguns alimentos para doar a quem estiver precisando.'),(26,15,'Estou precisando de uma geladeira para conseguir armazenar melhor os alimentos da minha casa. Comprar uma nova está fora das minhas condições financeiras neste momento. Se alguém tiver uma geladeira usada, mas funcionando corretamente, e puder doar, ficarei muito agradecida.','[\"/uploads/posts/1793973949834-9c35818619f07ea1bcdc192e803cb52d.png\"]',0,'2026-11-06 14:06:14','Estou procurando uma geladeira usada em bom estado para minha casa.'),(27,16,'Neste momento estou precisando de uma ajuda para complementar as compras de casa. Alguns alimentos básicos, como arroz, feijão, macarrão e óleo, já fariam diferença. Qualquer contribuição, mesmo pequena, será muito importante para mim. Agradeço pela atenção e pela solidariedade.','[\"/uploads/posts/1793974335085-91c4f1a14518fb99ba50ca0807d15709.png\"]',1,'2026-11-06 14:12:41','Estou precisando de uma ajuda com alimentos para complementar minhas compras.'),(28,17,'Depois de realizar alguns reparos em casa, sobraram materiais de construção que não serão utilizados. Prefiro doar esses itens para alguém que esteja fazendo alguma reforma ou precisando realizar pequenos consertos. Os materiais estão disponíveis para retirada e podem ser úteis para outra pessoa.','[\"/uploads/posts/1793974689880-7592f8af16080af879d8e76e021ef824.png\"]',1,'2026-11-06 14:18:39','Tenho alguns materiais de construção sobrando e gostaria de doar.'),(29,18,'Estou tentando organizar melhor minha casa e preciso de uma mesa com algumas cadeiras para a área de refeições. No momento, não tenho condições de comprar esses móveis novos. Caso alguém tenha um conjunto usado em bom estado e não utilize mais, ficarei muito agradecido.','[\"/uploads/posts/1793975207481-da083f80ff9bcdff598d8dc7e3098ecc.png\",\"/uploads/posts/1793975233021-d57f3a90a129bb814aae8839c7c8c0e5.png\"]',0,'2026-11-06 14:27:35','Estou procurando uma mesa e algumas cadeiras usadas para minha casa.'),(30,19,'Estou precisando de um fogão para conseguir preparar as refeições em casa com mais facilidade. Infelizmente, neste momento não tenho condições de comprar um novo. Se alguém tiver um fogão usado, funcionando e em bom estado, e puder ajudar, ficarei muito agradecida.','[\"/uploads/posts/1793975573645-bc0cb4aac40ce349e5d6457027e2e73f.png\",\"/uploads/posts/1793975600245-8535890e3b201e857eece88118ef1fe0.png\"]',0,'2026-11-06 14:33:44','Estou precisando de um fogão usado em boas condições para minha casa.');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `two_factor_verifications`
--

DROP TABLE IF EXISTS `two_factor_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `two_factor_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `purpose` varchar(20) NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `challenge_token_hash` varchar(255) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `two_factor_user_index` (`user_id`),
  KEY `two_factor_user_purpose_index` (`user_id`,`purpose`),
  KEY `two_factor_user_used_index` (`user_id`,`used`),
  KEY `two_factor_challenge_index` (`challenge_token_hash`),
  KEY `two_factor_expiration_index` (`expires_at`),
  CONSTRAINT `two_factor_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `two_factor_verifications`
--

LOCK TABLES `two_factor_verifications` WRITE;
/*!40000 ALTER TABLE `two_factor_verifications` DISABLE KEYS */;
INSERT INTO `two_factor_verifications` VALUES (4,3,'enable','$2b$10$gmurrjoKZbpg6DgGfP6I4.YB8If7BwGLIbiiWMXVzBrEXAUE4ECZm',NULL,'2026-09-14 12:36:03',0,1,'2026-09-14 12:26:03'),(7,3,'login','$2b$10$iGuSil2QlxHikpFe0CqX7OLghOf0c142BH9XkmPkX5p4y1Wc/kb3K','848441894751dc95badd8086e2229d3f26514318b4fcb437308ecee7e4e4edf8','2026-11-17 14:56:16',0,1,'2026-11-17 14:46:16');
/*!40000 ALTER TABLE `two_factor_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(160) NOT NULL,
  `password` varchar(255) NOT NULL,
  `photo` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(160) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `terms_accepted_at` datetime DEFAULT NULL,
  `terms_version` varchar(30) DEFAULT NULL,
  `privacy_version` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `email_23` (`email`),
  UNIQUE KEY `email_24` (`email`),
  UNIQUE KEY `email_25` (`email`),
  UNIQUE KEY `email_26` (`email`),
  UNIQUE KEY `email_27` (`email`),
  UNIQUE KEY `email_28` (`email`),
  UNIQUE KEY `email_29` (`email`),
  UNIQUE KEY `email_30` (`email`),
  UNIQUE KEY `email_31` (`email`),
  UNIQUE KEY `email_32` (`email`),
  UNIQUE KEY `email_33` (`email`),
  UNIQUE KEY `email_34` (`email`),
  UNIQUE KEY `email_35` (`email`),
  UNIQUE KEY `users_email_index` (`email`),
  KEY `users_two_factor_enabled_index` (`two_factor_enabled`),
  KEY `users_terms_version_index` (`terms_version`),
  KEY `users_privacy_version_index` (`privacy_version`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Etec','etec@gmail.com','$2b$10$Rw6q0NB1hYyNra0RNOXxd.3D1AsdcM0zK7EVgM4KjEvWXzcPGbYyC',NULL,NULL,NULL,'2026-05-19 14:00:26',0,NULL,NULL,NULL),(2,'Lucas ','lucasjr@gmail.com','$2b$10$pmTM7NOEALJ7GWNWMN4WG.SxeCGJAp1yEr0sIMwj96jXiaZkeI1bW',NULL,NULL,NULL,'2026-05-19 14:12:47',0,NULL,NULL,NULL),(3,'anthony rodrigues da silva','anthonyserrano894@gmail.com','$2b$10$pbVI2t/gjk1EM1Rr4QAmcekcaO10dbVK9OCIKEjjZxMrCArewn5mS','/uploads/users/1794926895591-6a66b02d8830885dddcc39ca1472f325.png','Tenho 18 anos e estou no ensino medio. Sou um dos desenvolvedores do Doalize, o app que voce esta utilizando.','Barra Bonita sp','2026-05-20 14:30:06',1,NULL,NULL,NULL),(4,'Vinicius Godoy Martins','Viniciusgodoy.martins2@gmail.com','$2b$10$6IBA6xPCOZx4PLjYnTiScOOSj.y5hIkLPbQGa0O8p51PW4wK/7DmG','/uploads/usuarioimage.png',NULL,NULL,'2026-08-26 16:40:01',0,NULL,NULL,NULL),(5,'Rhuan P','roii265p@gmail.com','$2b$10$k6015JXTVpI6mEjkztg53e5fHzhUlRmHtWssimB1gaWnWI2O09UeS','/uploads/users/1787762906273-9796a4af097ecbda2eb18ff5ffad0588.jpeg','Dev app','Barra Bonita','2026-08-26 16:42:31',0,NULL,NULL,NULL),(6,'Mariana Oliveira','marianaoliveira2026@gmail.com','$2b$10$w8CPJBBFpJ1GawDh26GogeSve6ivdjgHwktS/U7H3E3Ba/X/aMgwO','/uploads/users/1793966623206-f07d669ca4c7b6780577ea3259ee82b2.jpeg',NULL,'Sao Paulo','2026-11-06 12:02:07',0,'2026-11-06 12:02:07','1.0','1.0'),(7,'Rafael Santos','rafaelsantos2026@gmail.com','$2b$10$11o.rzoS/LBOj9Esoc5URuVanO2DcoRyxYeBAV.JGTk8y8UWc6/vy','/uploads/users/1793968246693-993f3d9a528d004ebfc3563c180540c1.jpeg',NULL,'Ouro velho','2026-11-06 12:29:48',0,'2026-11-06 12:29:48','1.0','1.0'),(8,'Sonia Aparecida','soniaaparecida2026@gmail.com','$2b$10$UDeDFVSMkgVr4T6qM3ssPugmGVVZ53v.mTrCZUmUv7cwc4/KS.cae','/uploads/users/1793970356158-caa2f652d1eea91c7675e872a51f3686.jpeg',NULL,NULL,'2026-11-06 13:02:12',0,'2026-11-06 13:02:12','1.0','1.0'),(9,'Juliana Ferreira','julianaferreira2026@gmail.com','$2b$10$GwpqcIRWkh1EKeYgiv9IHuje.ePcCUf/tFtPkc.IaSsfV75MHNfNi','/uploads/users/1793970754588-d608437790581add1d760aa8b81f4a24.jpeg','Moro em Curitiba, me mudei para fazer medicina veterinaria.\n19 anos e preciso de ajudar no que for possivel.','Curitiba','2026-11-06 13:11:00',0,'2026-11-06 13:11:00','1.0','1.0'),(10,'Diego Martins','diegomartins2026@gmail.com','$2b$10$17f.6y3fM1cJkSorxJfEYOKYuII6Zu/.AhrOkCEfEmNpO0W9F9ZIe','/uploads/users/1793971206206-63e0e24364d2be4dac7484eee371b789.jpeg','Sou programador front end, moro em Sao Paulo, tenho 26 anos, trabalho na area a 3 anos','Sao Paulo','2026-11-06 13:17:28',0,'2026-11-06 13:17:28','1.0','1.0'),(11,'Carlos Eduardo Lima','carloseduardo2026@gmail.com','$2b$10$uI1m0RYSHoZJAgZmOCvhZO1tZpa5GCJ3mIQiSR427WjCf.Wj13amy','/uploads/users/1793971789067-b45eee0a1bd96dd38871a347076cfeb3.jpeg','Motorista de van, caminhao, onibus, carro particular. 47 anos','Barra Bonita','2026-11-06 13:25:26',0,'2026-11-06 13:25:26','1.0','1.0'),(12,'Antonio Carlos souza','antoniocarlos2026@gmail.com','$2b$10$KRruJj/yrrzVsW.x1vjlb.TAD3v8ehz7oPUwhJUWojgDIej6FOyoS','/uploads/users/1793972493521-0e1b9505e27dde886ae571d8c1b39f06.jpeg','Ex engenheiro, 61 anos','Piaui','2026-11-06 13:39:25',0,'2026-11-06 13:39:25','1.0','1.0'),(13,'Camila Rodrigues','camilarodrigues2026@gmail.com','$2b$10$7vZH8l2zCtg8yBo9kjPwwevx8WsRt6So6sERsGIDnfbbfBJM2ikWW','/uploads/users/1793972832988-9046080205c8e4b457ff5ffcdbc41f5a.jpeg',NULL,'Rio de Janeiro','2026-11-06 13:45:29',0,'2026-11-06 13:45:29','1.0','1.0'),(14,'Andre Luiz Costa','andreluiz2026@gmail.com','$2b$10$tCdyWFSZ5AuJrwA1MmBt2efVRCxb9CkZxciCqXw0BC1TP9Bf/A8EG','/uploads/users/1793973565689-b5827fce2cfbb2322a128ba13411ac0e.jpeg',NULL,'Gramado','2026-11-06 13:58:29',0,'2026-11-06 13:58:29','1.0','1.0'),(15,'Patricia Gomes','patriciagomes2026@gmail.com','$2b$10$j65nCloM/vfhcuXCjS2wpOfowPKDjCAV7An5Q5JVN3eCNYeBqrHf2','/uploads/users/1793973891275-976be6b25a86bd0bb88a22c96e698445.jpeg',NULL,'Bauru','2026-11-06 14:03:52',0,'2026-11-06 14:03:52','1.0','1.0'),(16,'Rosangela Nunes','rosangelanunes2026@gmail.com','$2b$10$sYZsqdiB1uFPOQ3TaTdqwuPnEsv4rADOzSei2bOmJBFfXv8kdbL1W','/uploads/users/1793974229825-105b4d2bafd2d70c8af19c35a9bb0f68.png',NULL,'Ourinhos','2026-11-06 14:09:39',0,'2026-11-06 14:09:39','1.0','1.0'),(17,'Paulo Henrique','paulohenrique2026@gmail.com','$2b$10$d6WKnbLGoNv03UGfB4RnduoDGPxGFKenyxfmrhYROC9XPVuuinaZG','/uploads/users/1793974632474-720ef0f52819227e16057513e3544c7e.jpeg',NULL,'Piracicaba','2026-11-06 14:15:44',0,'2026-11-06 14:15:44','1.0','1.0'),(18,'Marcelo Pereira','marcelopereira2026@gmail.com','$2b$10$roOnibVN6CV0eeUgCNQAseHqxlhERkxICxm7LxkWw1m8MvHmLUi3C','/uploads/users/1793975131673-f451a07e3300bd454174bb72b268f8ed.jpeg',NULL,'Barra Bonita','2026-11-06 14:24:16',0,'2026-11-06 14:24:16','1.0','1.0'),(19,'Luciana Barbosa','lucianabarbosa2026@gmail.com','$2b$10$yRR/zXU6LkahUrGSY0kI8OjGdqq0rndl2kz8vJZxO6qzr3Dxg1Ofu','/uploads/users/1793975538728-2470377f7b2ff6943aa8d365cc08bf2f.jpeg',NULL,'Bauru','2026-11-06 14:31:32',0,'2026-11-06 14:31:32','1.0','1.0');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-17 11:51:27
