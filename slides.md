---
# theme: apple-basic  
background: /cover.png
lineNumbers: true
drawings:
  persist: false
routerMode: history
selectable: true
remoteAssets: true
colorSchema: 'dark'
layout: cover
canvasWidth: 800
---

# Crafting the Ultimate Docker Image for Spring Applications

<img src="/bellsoft.png" width="200px" class="absolute right-10px bottom-10px"/>

---
layout: image-right
image: 'avatar.jpg'
---
# `whoami`

<v-clicks>

- <div v-after>Pasha Finkelshteyn</div>
- Dev <noto-v1-avocado /> at BellSoft
- ≈10 years in JVM. Mostly <logos-java /> and <logos-kotlin-icon />
- And <logos-spring-icon />
- <logos-twitter /> asm0di0
- <logos-mastodon-icon /> @asm0dey@fosstodon.org

</v-clicks>

---
layout: two-cols-header
---

# BellSoft

::left::

* Vendor of Liberica JDK
* Contributor to the OpenJDK
* Author of ARM32 support in JDK
* Own base images
* Own Linux: Alpaquita

Liberica is the JDK officially recommended by <logos-spring-icon />

<v-click><b>We know our stuff!</b></v-click>

::right::

<img src="/news.png" class="invert rounded self-center"/>


---

# So, what is ultimate?

- Smallest
- Fatsest startup
- Something inbetween

---
layout: statement
---

# So, let's look at all of them!

---

# How do we create an image?

Let's start from trivial.

```docker {none|1|3|4|all}
FROM bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl

COPY . /app
RUN cd /app && ./gradlew build
ENTRYPOINT     java -jar /app/build/libs/spring-petclinic*.jar
```

---

# `Dockerfile` directives

1. Each directive creates a layer of the image.
2. Layers are *immutable*
3. Some layers are zero-sized <span v-click="3">(for example `RUN rm -rf /app`)</span>
<div v-click="1">

```docker {1|3|4}{at:2}
FROM bash

COPY . /app
RUN rm -rf /app
```

</div>
<v-click at="4">

4. We would like image to be light, but it's not :(

</v-click>  
---

# Our `Dockerfile`

```docker {1|3|4|5}
FROM bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl

COPY . /app
RUN cd /app && ./gradlew build
ENTRYPOINT java -jar /app/build/libs/spring-petclinic*.jar
```

---

# Result

```text {18-28|1,17|1,6-16|1,5|1,4|1,3|1,2}{maxHeight:'300px'}
ID         TAG                                                    SIZE      COMMAND
cda5201e70 dumb:latest                                            0B        CMD ["/bin/sh"
74a0788411                                                        512.03MiB /bin/sh -c cd /
7b82eb08ec                                                        67.41MiB  COPY dir:ef251b
e4bcf83d29 bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl 98.32MiB  |15 BUNDLE_TYPE
<missing>                                                         0B        ENV JAVA_HOME="
<missing>                                                         0B        ENV LANG=en_US.
<missing>                                                         0B        LABEL org.openc
<missing>                                                         0B        LABEL org.openc
<missing>                                                         0B        LABEL maintaine
<missing>                                                         0B        ARG BUNDLE_TYPE
<missing>                                                         0B        ARG BUNDLE_TYPE
<missing>                                                         0B        ARG BUNDLE_TYPE
<missing>                                                         0B        ARG BUNDLE_TYPE
<missing>                                                         0B        ARG BUNDLE_TYPE
<missing>                                                         0B        ARG JAVA_RELEAS
<missing>                                                         7.49MiB   CMD ["/bin/sh"]
<missing>                                                         0B        |9 APK_REPOS= D
<missing>                                                         0B        ADD file:a4d77f
<missing>                                                         0B        LABEL org.openc
<missing>                                                         0B        LABEL org.openc
<missing>                                                         0B        LABEL maintaine
<missing>                                                         0B        ARG APK_REPOS D
<missing>                                                         0B        ARG APK_REPOS L
<missing>                                                         0B        ARG APK_REPOS L
<missing>                                                         0B        ARG APK_REPOS L
<missing>                                                         0B        ARG LIBC MINIRO
<missing>                                                         0B        ARG MINIROOTFS
```

---
layout: two-cols-header
---

# 579.44 MB are changed on every build!

::left::

Why do we care? We care because:

1. `push` takes longer time to start <br/>(update is longer)
2. `pull` takes longer <br/> (update takes longer & scaling takes longer)

Also, more disk psace is inefficiently used

::right::

<img src="/clocks.png" class="max-h-330px rounded self-center">

---

# Optimizing. Round 1.

Let's build it outside of container

````md magic-move
```docker {3-5}
FROM bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl

COPY . /app
RUN cd /app && ./gradlew build
ENTRYPOINT java -jar /app/build/libs/spring-petclinic*.jar
```
```docker {3-4|all}
FROM bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl

COPY build/libs/spring-petclinic-3.3.0.jar /app/app.jar
CMD java -jar /app/app.jar
```
````

<span v-click="2">Just copying the prebuilt `jar` file</span>

---

# Results

````md magic-move
```plain {1-4}
ID         TAG                                                    SIZE      COMMAND
cda5201e70 dumb:latest                                            0B        CMD ["/bin/sh" "-c" "/app/build/libs/spring-petclinic*.
74a0788411                                                        512.03MiB /bin/sh -c cd /app && ./gradlew build
7b82eb08ec                                                        67.41MiB  COPY dir:ef251bd1e17ac0afee8fa279c87fa2e7a561e3ea2550a2
e4bcf83d29 bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl 98.32MiB  |15 BUNDLE_TYPE=jdk CDS=no DESCRIPTION=Alpaquita Stream
<missing>                                                         0B        ENV JAVA_HOME="/usr/lib/jvm/liberica${JAVA_RELEASE}-lit
<missing>                                                         0B        ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en
<missing>                                                         0B        LABEL org.opencontainers.image.description="$DESCRIPTIO
<missing>                                                         0B        LABEL org.opencontainers.image.authors="$MAINTAINER"
<missing>                                                         0B        LABEL maintainer="$MAINTAINER"
<missing>                                                         0B        ARG BUNDLE_TYPE CDS DESCRIPTION JAVA_RELEASE MAINTAINER
<missing>                                                         0B        ARG BUNDLE_TYPE CDS JAVA_RELEASE MAINTAINER REMOVE_APK_
<missing>                                                         0B        ARG BUNDLE_TYPE CDS JAVA_RELEASE REMOVE_APK_TOOLS
<missing>                                                         0B        ARG BUNDLE_TYPE CDS JAVA_RELEASE
<missing>                                                         0B        ARG BUNDLE_TYPE JAVA_RELEASE
<missing>                                                         0B        ARG JAVA_RELEASE
<missing>                                                         7.49MiB   CMD ["/bin/sh"]
```
```plain {1-3}
ID         TAG                                                    SIZE     COMMAND
cefb30e21d smarter:latest                                         0B       CMD ["/bin/sh" "-c" "java -jar /app/app.jar"]
46d7594000                                                        58.80MiB COPY file:8d96bee95ae5ce431ee4bc4de6cf0725f36464e95bc0d
e4bcf83d29 bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl 98.32MiB |15 BUNDLE_TYPE=jdk CDS=no DESCRIPTION=Alpaquita Stream
<missing>                                                         0B       ENV JAVA_HOME="/usr/lib/jvm/liberica${JAVA_RELEASE}-lit
<missing>                                                         0B       ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en
<missing>                                                         0B       LABEL org.opencontainers.image.description="$DESCRIPTIO
<missing>                                                         0B       LABEL org.opencontainers.image.authors="$MAINTAINER"
<missing>                                                         0B       LABEL maintainer="$MAINTAINER"
<missing>                                                         0B       ARG BUNDLE_TYPE CDS DESCRIPTION JAVA_RELEASE MAINTAINER
<missing>                                                         0B       ARG BUNDLE_TYPE CDS JAVA_RELEASE MAINTAINER REMOVE_APK_
<missing>                                                         0B       ARG BUNDLE_TYPE CDS JAVA_RELEASE REMOVE_APK_TOOLS
<missing>                                                         0B       ARG BUNDLE_TYPE CDS JAVA_RELEASE
<missing>                                                         0B       ARG BUNDLE_TYPE JAVA_RELEASE
<missing>                                                         0B       ARG JAVA_RELEASE
<missing>                                                         7.49MiB  CMD ["/bin/sh"]
```
````

---
layout: statement
---

# Saved 500+ MB

## But the build is not clean now :(

<v-click>We have to build everything outside, what if environment affects the build?</v-click>

---
layout: cover
background: cover2.png
---

# Enter build stages

---

# Multi-stage builds

Holy grail of pure builds

* Allow clean builds
* Allow optimal packaging
* Allow different base images

---

# Staged example

```docker {none|1|3|4|6|8}
FROM bellsoft/liberica-runtime-container:jdk-musl as builder

COPY . /app
RUN cd /app && ./gradlew build -xtest

FROM bellsoft/liberica-runtime-container:jre-slim-musl as runner

COPY --from=builder /app/build/libs/spring-petclinic-3.3.0.jar /app/app.jar
```

--- 

# Result

```plain {1-4|1-3}{maxHeight:'300px'}
ID         TAG                                                    SIZE     COMMAND                                                 │
6ea7ad11af smarter:latest                                         0B       CMD ["/bin/sh" "-c" "java -jar /app/app.jar"]           │
d6eb71a5df                                                        58.80MiB COPY file:8d96bee95ae5ce431ee4bc4de6cf0725f36464e95bc0da│
c6ede8dac2 bellsoft/liberica-runtime-container:jdk-21.0.3_10-musl 98.32MiB |15 BUNDLE_TYPE=jdk CDS=no DESCRIPTION=Alpaquita Stream │
<missing>                                                         0B       ENV JAVA_HOME="/usr/lib/jvm/liberica${JAVA_RELEASE}-lite│
<missing>                                                         0B       ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en                  │
<missing>                                                         0B       LABEL org.opencontainers.image.description="$DESCRIPTION│
<missing>                                                         0B       LABEL org.opencontainers.image.authors="$MAINTAINER"    │
<missing>                                                         0B       LABEL maintainer="$MAINTAINER"                          │
<missing>                                                         0B       ARG BUNDLE_TYPE CDS DESCRIPTION JAVA_RELEASE MAINTAINER │
<missing>                                                         0B       ARG BUNDLE_TYPE CDS JAVA_RELEASE MAINTAINER REMOVE_APK_T│
<missing>                                                         0B       ARG BUNDLE_TYPE CDS JAVA_RELEASE REMOVE_APK_TOOLS       │
<missing>                                                         0B       ARG BUNDLE_TYPE CDS JAVA_RELEASE                        │
<missing>                                                         0B       ARG BUNDLE_TYPE JAVA_RELEASE                            │
<missing>                                                         0B       ARG JAVA_RELEASE                                        │
<missing>                                                         7.49MiB  CMD ["/bin/sh"]                                         │
<missing>                                                         0B       |9 APK_REPOS= DESCRIPTION=Alpaquita Stream Musl LIBC=mus│
<missing>                                                         0B       ADD file:14e53548e85f6cc14e8df4238bba40aebf74e9ca0feb8ec│
<missing>                                                         0B       LABEL org.opencontainers.image.description="$DESCRIPTION│
<missing>                                                         0B       LABEL org.opencontainers.image.authors="$MAINTAINER"    │
<missing>                                                         0B       LABEL maintainer="$MAINTAINER"                          │
<missing>                                                         0B       ARG APK_REPOS DESCRIPTION LIBC LOCALES MAINTAINER MINIRO│
<missing>                                                         0B       ARG APK_REPOS LIBC LOCALES MAINTAINER MINIROOTFS        │
<missing>                                                         0B       ARG APK_REPOS LIBC LOCALES MINIROOTFS                   │
<missing>                                                         0B       ARG APK_REPOS LIBC MINIROOTFS                           │
<missing>                                                         0B       ARG LIBC MINIROOTFS                                     │
<missing>                                                         0B       ARG MINIROOTFS                                          │
                                                                                                                                   │
```

---
layout: statement
---

# That's all folks!

<h2 v-click>Or is it?</h2>

---

# What's these 59 MiB?

We have to pull 59 MiB of petclinic on every small commit!

Is there a way to optimize it?

---

# Layers!

```docker {1-4|6|8,9|10|12,6|15-18|14}{maxHeight:'180px'}
FROM bellsoft/liberica-runtime-container:jdk-musl as builder

COPY . /app
RUN cd /app && ./gradlew build -xtest

FROM bellsoft/liberica-runtime-container:jre-slim-musl as optimizer

COPY --from=builder /app/build/libs/spring-petclinic-3.3.0.jar /app/app.jar
WORKDIR /app
RUN java -Djarmode=tools -jar /app/app.jar extract --layers --launcher

FROM bellsoft/liberica-runtime-container:jre-slim-musl as runner

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
COPY --from=optimizer /app/app/dependencies/ ./
COPY --from=optimizer /app/app/spring-boot-loader/ ./
COPY --from=optimizer /app/app/snapshot-dependencies/ ./
COPY --from=optimizer /app/app/application/ ./
```

- Build image

<v-click at="1">

- Introduce new "optimizer" stage

</v-click>
<v-click at="3">

- Extract the jar to layered structure

</v-click>
<v-click at="5">

- Copy layers

</v-click>

---

# Layers

Because Spring Boot jar is complex!

```plain      
Usage:
  java -Djarmode=tools -jar my-app.jar

Available commands:
  extract      Extract the contents from the jar
  list-layers  List layers from the jar that can be extracted
```

---

# Layers

```plain {1|2|5-9|11-16|17|20,21|22|24-29|31,32|35|35,37-39|40|41|155}{maxHeight:'200px'}
app
├── application
│   ├── BOOT-INF
│   │   ├── classes
│   │   │   ├── application-mysql.properties
│   │   │   ├── application-postgres.properties
│   │   │   ├── application.properties
│   │   │   ├── banner.txt
│   │   │   ├── db
│   │   │   │   ├── ...
│   │   │   ├── org
│   │   │   │   └── springframework
│   │   │   │       ├── aop
│   │   │   │       │   └── aspectj
│   │   │   │       │       └── annotation
│   │   │   │       │           └── AnnotationAwareAspectJAutoProxyCreator__BeanDefinitions.class
|   |   |   |       ├── com/github/asm0dey/...
│   │   │   ├── static
│   │   │   ....
│   │   ├── classpath.idx
│   │   └── layers.idx
│   └── META-INF
│       ├── MANIFEST.MF
│       ├── native-image
│       │   ├── ch.qos.logback
│       │   │   └── logback-classic
│       │   │       └── 1.5.6
│       │   │           ├── reflect-config.json
│       │   │           └── resource-config.json
│       │   ├── ...
│       ├── sbom
│       │   └── application.cdx.json
│       └── services
│           └── java.nio.file.spi.FileSystemProvider
├── dependencies
│   └── BOOT-INF
│       └── lib
│           ├── angus-activation-2.0.2.jar
│           ├── ...
├── snapshot-dependencies
└── spring-boot-loader
    └── org
        └── springframework
            └── boot
                └── loader
                    ├── jar
                    │   ├── ManifestInfo.class
                    │   ├── MetaInfVersionsInfo.class
                    │   ├── NestedJarFile$JarEntriesEnumeration.class
                    │   ├── NestedJarFile$JarEntryInflaterInputStream.class
                    │   ├── NestedJarFile$JarEntryInputStream.class
                    │   ├── NestedJarFile$NestedJarEntry.class
                    │   ├── NestedJarFile$RawZipDataInputStream.class
                    │   ├── NestedJarFile$ZipContentEntriesSpliterator.class
                    │   ├── NestedJarFile.class
                    │   ├── NestedJarFileResources.class
                    │   ├── SecurityInfo.class
                    │   └── ZipInflaterInputStream.class
                    ├── jarmode
                    │   └── JarMode.class
                    ├── launch
                    │   ├── Archive$Entry.class
                    │   ├── Archive.class
                    │   ├── ClassPathIndexFile.class
                    │   ├── ExecutableArchiveLauncher.class
                    │   ├── ExplodedArchive$FileArchiveEntry.class
                    │   ├── ExplodedArchive.class
                    │   ├── JarFileArchive$JarArchiveEntry.class
                    │   ├── JarFileArchive.class
                    │   ├── JarLauncher.class
                    │   ├── JarModeRunner.class
                    │   ├── LaunchedClassLoader$DefinePackageCallType.class
                    │   ├── LaunchedClassLoader.class
                    │   ├── Launcher.class
                    │   ├── PropertiesLauncher$Instantiator$Using.class
                    │   ├── PropertiesLauncher$Instantiator.class
                    │   ├── PropertiesLauncher.class
                    │   ├── SystemPropertyUtils.class
                    │   └── WarLauncher.class
                    ├── log
                    │   ├── DebugLogger$DisabledDebugLogger.class
                    │   ├── DebugLogger$SystemErrDebugLogger.class
                    │   └── DebugLogger.class
                    ├── net
                    │   ├── protocol
                    │   │   ├── Handlers.class
                    │   │   ├── jar
                    │   │   │   ├── Canonicalizer.class
                    │   │   │   ├── Handler.class
                    │   │   │   ├── JarFileUrlKey.class
                    │   │   │   ├── JarUrl.class
                    │   │   │   ├── JarUrlClassLoader$OptimizedEnumeration.class
                    │   │   │   ├── JarUrlClassLoader.class
                    │   │   │   ├── JarUrlConnection$ConnectionInputStream.class
                    │   │   │   ├── JarUrlConnection$EmptyUrlStreamHandler.class
                    │   │   │   ├── JarUrlConnection.class
                    │   │   │   ├── LazyDelegatingInputStream.class
                    │   │   │   ├── Optimizations.class
                    │   │   │   ├── UrlJarEntry.class
                    │   │   │   ├── UrlJarFile.class
                    │   │   │   ├── UrlJarFileFactory.class
                    │   │   │   ├── UrlJarFiles$Cache.class
                    │   │   │   ├── UrlJarFiles.class
                    │   │   │   ├── UrlJarManifest$ManifestSupplier.class
                    │   │   │   ├── UrlJarManifest.class
                    │   │   │   └── UrlNestedJarFile.class
                    │   │   └── nested
                    │   │       ├── Handler.class
                    │   │       ├── NestedLocation.class
                    │   │       ├── NestedUrlConnection$ConnectionInputStream.class
                    │   │       ├── NestedUrlConnection.class
                    │   │       └── NestedUrlConnectionResources.class
                    │   └── util
                    │       └── UrlDecoder.class
                    ├── nio
                    │   └── file
                    │       ├── NestedByteChannel$Resources.class
                    │       ├── NestedByteChannel.class
                    │       ├── NestedFileStore.class
                    │       ├── NestedFileSystem.class
                    │       ├── NestedFileSystemProvider.class
                    │       ├── NestedPath.class
                    │       └── UriPathEncoder.class
                    ├── ref
                    │   ├── Cleaner.class
                    │   └── DefaultCleaner.class
                    └── zip
                        ├── ByteArrayDataBlock.class
                        ├── CloseableDataBlock.class
                        ├── DataBlock.class
                        ├── DataBlockInputStream.class
                        ├── FileDataBlock$FileAccess.class
                        ├── FileDataBlock$Tracker$1.class
                        ├── FileDataBlock$Tracker.class
                        ├── FileDataBlock.class
                        ├── NameOffsetLookups.class
                        ├── VirtualDataBlock.class
                        ├── VirtualZipDataBlock$DataPart.class
                        ├── VirtualZipDataBlock.class
                        ├── Zip64EndOfCentralDirectoryLocator.class
                        ├── Zip64EndOfCentralDirectoryRecord.class
                        ├── ZipCentralDirectoryFileHeaderRecord.class
                        ├── ZipContent$Entry.class
                        ├── ZipContent$Kind.class
                        ├── ZipContent$Loader.class
                        ├── ZipContent$Source.class
                        ├── ZipContent.class
                        ├── ZipDataDescriptorRecord.class
                        ├── ZipEndOfCentralDirectoryRecord$Located.class
                        ├── ZipEndOfCentralDirectoryRecord.class
                        ├── ZipLocalFileHeaderRecord.class
                        ├── ZipString$CompareType.class
                        └── ZipString.class

212 directories, 525 files
```

---

# Layered image structure

```plain {1-7|5|4|3|2|all}{maxHeight:'180px'}
ID         TAG                                               SIZE      COMMAND
618743f6a2 layers:latest                                     2.96MiB   COPY dir:e0faa63b9654445b16f92e448ea614724879b78e0dc07eb0191
9cca3273f0                                                   0B        COPY dir:acd0d0ac1f7df30859922a3cc7ed781663b36acddf4348771e3
fe123ee16e                                                   382.56kiB COPY dir:01225d3c4ef6d018ae82263401e55afa676d0c336b74d58e845
dede9bac3d                                                   57.69MiB  COPY dir:755815d928fd961d6390c53529fa7d29169f1f3c9ae42f387fd
65e3fb4cbf                                                   0B        ENTRYPOINT ["java" "org.springframework.boot.loader.launch.J
7130fa5864 bellsoft/liberica-runtime-container:jre-slim-musl 126.80MiB |18 CDS=no DESCRIPTION=Alpaquita Stream Musl based image wit
<missing>                                                    0B        ENV JAVA_HOME="/usr/lib/jvm/liberica${JAVA_RELEASE}-containe
<missing>                                                    0B        ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en
<missing>                                                    0B        LABEL org.opencontainers.image.description="$DESCRIPTION"
<missing>                                                    0B        LABEL org.opencontainers.image.authors="$MAINTAINER"
<missing>                                                    0B        LABEL maintainer="$MAINTAINER"
<missing>                                                    0B        ARG CDS DESCRIPTION JAVA_RELEASE MAINTAINER REMOVE_APK_TOOLS
<missing>                                                    0B        ARG CDS JAVA_RELEASE MAINTAINER REMOVE_APK_TOOLS
<missing>                                                    0B        ARG CDS JAVA_RELEASE REMOVE_APK_TOOLS
<missing>                                                    0B        ARG CDS JAVA_RELEASE
<missing>                                                    0B        ARG JAVA_RELEASE
```

<v-click at="1">

- Dependencies: ~57.7MiB

</v-click>
<v-click at="2">

- Launcher: 382.56kiB

</v-click>
<v-click at="4">

- Application: ~3MiB

</v-click>
<v-click at="5">

Together: ~61MiB

</v-click>

---
layout: statement
image: /cap.png
---

# 61.0MiB > 58.8Mib!

## 😱

---

# What are we optimizing?

Pull size!

Pull size here is usually only around 3MiB!

---
layout: statement
---

# We just reinvented how the BellSoft's buildpack works!

And it is amazing

---

# Diversion: buildpacks

https://paketo.io/

Trivial usage:

```bash {1|2|3|4}
/usr/sbin/pack build petclinic \
  --builder bellsoft/buildpacks.builder \
  --path . \
  -e BP_JVM_VERSION=21
```

---

# Result

``` {7|5|4|3}
ID         TAG              SIZE      COMMAND                                                                               │
2774e3f214 petclinic:latest 0B        Buildpacks Process Types                                                              │
<missing>                   1.44kiB   Buildpacks Launcher Config                                                            │
<missing>                   2.44MiB   Buildpacks Application Launcher                                                       │
<missing>                   59.17MiB  Application Layer                                                                     │
<missing>                   729.21kiB Software Bill-of-Materials                                                            │
<missing>                   97.87MiB  Layer: 'jre', Created by buildpack: bellsoft/buildpacks/liberica@1.1.0                │
<missing>                   200.00B   Layer: 'java-security-properties', Created by buildpack: bellsoft/buildpacks/liberica@│
<missing>                   4.27MiB   Layer: 'helper', Created by buildpack: bellsoft/buildpacks/liberica@1.1.0             │
<missing>                   2.97kiB                                                                                         │
<missing>                   7.48MiB                                                                                         │
```

---

# Buildpacks

Why do we need them?

> * Buildpacks transform your application source code into container images
> * The Paketo open source project provides production-ready buildpacks for the most popular languages and frameworks
> * Use Paketo Buildpacks to easily build your apps and keep them updated 

- Reminds of s2i images
- Build better than default
- Spring-aware

---
layout: statement
---

# Is this all?

We've optimized pull/push size, right?

---

# Optimization is multidimensional

When startup time is more important…

There are several solutions for the Spring application startup time

1. Class Data Sharing (CDS)
2. Coordinated Restore at Checkpoint
3. Native Image

---

# Class Data Sharing (CDS)

* **When**: Java 5 (!)
* **Why**: reduce the startup and memory footprint of multiple JVM instances running on the same host
* **How**: stores data in an archive

How does it help us?

<v-click>It does not! <twemoji-troll /></v-click>
<v-click>But</v-click>

---

# Application Class Data Sharing  

* **When**: Java 10
* **Why**: add application classes to the archive

And then:

* **When**: Java 13, [JEP 350](https://openjdk.org/jeps/350)
* **Why**: allow addition of classes into the archive upon app exit!

And this helps! How?

---

# How to use AppCDS with Spring?

* `-XX:ArchiveClassesAtExit=application.jsa` to create an archive
* `-Dspring.context.exit=onRefresh` to start and immediately exit the application

NB:
1. Use the same JDK
2. Use the same arguments

---

# And even better!

Spring AOT

Add `-Dspring.aot.enabled=true`

Even more classes!!!

---

# Practice

````md magic-move
```docker {all|12}{maxHeight:'100px'}
FROM bellsoft/liberica-runtime-container:jdk-musl as builder

COPY . /app
RUN cd /app && ./gradlew build -xtest

FROM bellsoft/liberica-runtime-container:jre-slim-musl as optimizer

COPY --from=builder /app/build/libs/spring-petclinic-3.3.0.jar /app/app.jar
WORKDIR /app
RUN java -Djarmode=tools -jar /app/app.jar extract --layers --launcher

FROM bellsoft/liberica-runtime-container:jre-slim-musl as runner

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
COPY --from=optimizer /app/app/dependencies/ ./
COPY --from=optimizer /app/app/spring-boot-loader/ ./
COPY --from=optimizer /app/app/snapshot-dependencies/ ./
COPY --from=optimizer /app/app/application/ ./
```
```docker {12|15-18}{maxHeight:'100px'}
FROM bellsoft/liberica-runtime-container:jdk-musl as builder

COPY . /app
RUN cd /app && ./gradlew build -xtest

FROM bellsoft/liberica-runtime-container:jre-slim-musl as optimizer

COPY --from=builder /app/build/libs/spring-petclinic-3.3.0.jar /app/app.jar
WORKDIR /app
RUN java -Djarmode=tools -jar /app/app.jar extract --layers --launcher

FROM bellsoft/liberica-runtime-container:jre-cds-slim-musl as runner

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
COPY --from=optimizer /app/app/dependencies/ ./
COPY --from=optimizer /app/app/spring-boot-loader/ ./
COPY --from=optimizer /app/app/snapshot-dependencies/ ./
COPY --from=optimizer /app/app/application/ ./
```
```docker {9-12|4}{maxHeight:'100px'}
#omitted
FROM bellsoft/liberica-runtime-container:jre-cds-slim-musl as runner

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
COPY --from=optimizer /app/app/dependencies/ ./
COPY --from=optimizer /app/app/spring-boot-loader/ ./
COPY --from=optimizer /app/app/snapshot-dependencies/ ./
COPY --from=optimizer /app/app/application/ ./
RUN java -Dspring.aot.enabled=true \
  -XX:ArchiveClassesAtExit=./application.jsa \
  -Dspring.context.exit=onRefresh \
  org.springframework.boot.loader.launch.JarLauncher
```
```docker {4-7|all}{maxHeight:'100px'}
#omitted
FROM bellsoft/liberica-runtime-container:jre-cds-slim-musl as runner

ENTRYPOINT ["java", \
            "-Dspring.aot.enabled=true", \
            "-XX:SharedArchiveFile=application.jsa", \
            "org.springframework.boot.loader.launch.JarLauncher"]
COPY --from=optimizer /app/app/dependencies / ./
COPY --from=optimizer /app/app/spring-boot-loader/ ./
COPY --from=optimizer /app/app/snapshot-dependencies/ ./
COPY --from=optimizer /app/app/application/ ./
RUN java -Dspring.aot.enabled=true \
  -XX:ArchiveClassesAtExit=./application.jsa \
  -Dspring.context.exit=onRefresh \
  org.springframework.boot.loader.launch.JarLauncher
```
````

---

# What does it cost ?

```
-r--r--r--         0:0      81 MB  ├── application.jsa
```

Which is not small at all!

<v-click>But you're trading pull speed for startup speed</v-click>

---
layout: statement
---

# How much faster?

## Up to 50-60%

---

# Pushing further with CRaC

CRaC: Coordinated Restore at Checkpoint

> The CRaC (Coordinated Restore at Checkpoint) Project researches coordination of Java programs with mechanisms to checkpoint (make an image of, snapshot) a Java instance while it is executing. Restoring from the image could be a solution to some of the problems with the start-up and warm-up times. The primary aim of the Project is to develop a new standard mechanism-agnostic API to notify Java programs about the checkpoint and restore events. Other research activities will include, but will not be limited to, integration with existing checkpoint/restore mechanisms and development of new ones, changes to JVM and JDK to make images smaller and ensure they are correct.

https://openjdk.org/projects/crac/

---

# In a perfect world it should be:

```docker {6,12|9,10|14-16}
FROM bellsoft/liberica-runtime-container:jdk-musl as builder

COPY . /app
RUN cd /app && ./gradlew build

FROM bellsoft/liberica-runtime-container:jre-crac-slim as optimizer

COPY --from=builder /app/build/libs/spring-petclinic-3.3.0.jar /app/app.jar
WORKDIR /app
RUN java -Dspring.context.checkpoint=onRefresh -XX:CRaCCheckpointTo=/checkpoint -jar /app/app.jar

FROM bellsoft/liberica-runtime-container:jre-crac-slim as runner

ENTRYPOINT java -XX:CRaCRestoreFrom=/checkpoint
COPY --from=optimizer /app/app.jar /app/app.jar
COPY --from=optimizer /checkpoint /checkpoint
```

---

# But in reality

```
#12 6.051       Suppressed: java.lang.RuntimeException: Native checkpoint failed.
#12 6.051               at java.base/jdk.crac.Core.translateJVMExceptions(Core.java:114) ~[na:na]
#12 6.051               at java.base/jdk.crac.Core.checkpointRestore1(Core.java:192) ~[na:na]
#12 6.051               at java.base/jdk.crac.Core.checkpointRestore(Core.java:299) ~[na:na]
#12 6.051               at java.base/jdk.crac.Core.checkpointRestore(Core.java:278) ~[na:na]
#12 6.051               at java.base/javax.crac.Core.checkpointRestore(Core.java:73) ~[na:na]
#12 6.051               at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(DirectMethodHandleAccessor.java:103) ~[na:na]
#12 6.051               at java.base/java.lang.reflect.Method.invoke(Method.java:580) ~[na:na]
#12 6.051               at org.crac.Core$Compat.checkpointRestore(Core.java:141) ~[crac-1.4.0.jar!/:na]
#12 6.051               ... 17 common frames omitted
```

---

# CRaC is hard!

Let's try to fix it with arcane magic

````md magic-move
```docker
FROM bellsoft/liberica-runtime-container:jdk-musl as builder

COPY . /app
RUN cd /app && ./gradlew build -xtest

FROM bellsoft/liberica-runtime-container:jre-crac-slim as optimizer

COPY --from=builder /app/build/libs/spring-petclinic-3.3.0.jar /app/app.jar
WORKDIR /app
RUN java -Dspring.context.checkpoint=onRefresh -XX:CRaCCheckpointTo=/checkpoint -jar /app/app.jar

FROM bellsoft/liberica-runtime-container:jre-crac-slim as runner

ENTRYPOINT java -XX:CRaCRestoreFrom=/checkpoint
COPY --from=optimizer /app/app.jar /app/app.jar
COPY --from=optimizer /checkpoint /checkpoint
```
```docker {all|1|11}
# syntax=docker/dockerfile:1-labs
FROM bellsoft/liberica-runtime-container:jdk-musl as builder

COPY . /app
RUN cd /app && ./gradlew build -xtest

FROM bellsoft/liberica-runtime-container:jre-crac-slim as optimizer

COPY --from=builder /app/build/libs/spring-petclinic-3.3.0.jar /app/app.jar
WORKDIR /app
RUN java -Dspring.context.checkpoint=onRefresh -XX:CRaCCheckpointTo=/checkpoint -jar /app/app.jar

FROM bellsoft/liberica-runtime-container:jre-crac-slim as runner

ENTRYPOINT java -XX:CRaCRestoreFrom=/checkpoint
COPY --from=optimizer /app/app.jar /app/app.jar
COPY --from=optimizer /checkpoint /checkpoint
```
```docker {11,12}
# syntax=docker/dockerfile:1-labs
FROM bellsoft/liberica-runtime-container:jdk-musl as builder

COPY . /app
RUN cd /app && ./gradlew build -xtest

FROM bellsoft/liberica-runtime-container:jre-crac-slim as optimizer

COPY --from=builder /app/build/libs/spring-petclinic-3.3.0.jar /app/app.jar
WORKDIR /app
RUN --security=insecure java -Dspring.context.checkpoint=onRefresh \
  -XX:CRaCCheckpointTo=/checkpoint -jar /app/app.jar

FROM bellsoft/liberica-runtime-container:jre-crac-slim as runner

ENTRYPOINT java -XX:CRaCRestoreFrom=/checkpoint
COPY --from=optimizer /app/app.jar /app/app.jar
COPY --from=optimizer /checkpoint /checkpoint
```
```docker {11,12}
# syntax=docker/dockerfile:1-labs
FROM bellsoft/liberica-runtime-container:jdk-musl as builder

COPY . /app
RUN cd /app && ./gradlew build -xtest

FROM bellsoft/liberica-runtime-container:jre-crac-slim as optimizer

COPY --from=builder /app/build/libs/spring-petclinic-3.3.0.jar /app/app.jar
WORKDIR /app
RUN --security=insecure java -Dspring.context.checkpoint=onRefresh \
  -XX:CRaCCheckpointTo=/checkpoint -jar /app/app.jar || true

FROM bellsoft/liberica-runtime-container:jre-crac-slim as runner

ENTRYPOINT java -XX:CRaCRestoreFrom=/checkpoint
COPY --from=optimizer /app/app.jar /app/app.jar
COPY --from=optimizer /checkpoint /checkpoint
```
````


---

# And this is not all!

Did you hear about `buildx`?

````md magic-move
```bash {1,2|3}
docker buildx create --buildkitd-flags \
    '--allow-insecure-entitlement security.insecure' \
    --name insecure-builder
```
```bash
docker buildx use insecure-builder
```
```bash {1|2|3,4}
docker buildx build \
    --allow security.insecure \
    -f Dockerfile.crac \
    -t pet-crac --output type=docker .
```
```bash
docker run --rm -it --privileged pet-crac
```
```plain  {all|4}
Restarting Spring-managed lifecycle beans after JVM restore
HikariPool-1 - Thread starvation or clock leap detected (housekeeper delta=1d19h37m42s102ms798µs806ns).
Tomcat started on port 8080 (http) with context path '/'
Restored PetClinicApplication in 0.186 seconds (process running for 0.19)
```
````

---

# Is it a good solution?

It depends

<v-clicks>

* If "It Works" is enough for you <span v-click=2>-> **YES**</span>
* If you need more predictable and maintanable thing <span v-click=4>-> **NO**</span>

</v-clicks>

---

# How to make it better?

<v-clicks depth="2">

1. Build JAR (in docker or not)
2. Create new image that will run the JAR with CRaC arguments in `ENTRYPOINT`
3. Run the container with capabilities:
    1. CAP_SYS_PTRACE
    2. CAP_CHECKPOINT_RESTORE
4. Container will run and stop
5. Commit the container like
    ```bash
    docker commit container-id new-tag
    ```

</v-clicks>

---
layout: two-cols
---

# Pros and Cons

## Pros:

1. Does not require arcane magic
2. Works more predictably
3. Does not depend on unstable features
4. Does not require privileged containers in 

::right::

# <br/>

## Cons:

1. Organization-specific
2. Requires more steps

---
layout: statement
---

# And now we have all flavours of ultimate docker images!

---

# Quick summary?

1. Use layers for faster deployment
2. Use CDS for faster startup without many compromises
3. Use CRaC for a *lightning-fast* startup (with compromises)

---
layout: two-cols-header
---

# Thank you!

::left::

Find me @

- <logos-twitter /> asm0di0
- <logos-mastodon-icon /> @asm0dey@fosstodon.org
- <logos-google-gmail /> me@asm0dey.site
- <logos-linkedin-icon /> asm0dey
- <logos-telegram /> asm0dey
- <logos-whatsapp-icon /> asm0dey
- <skill-icons-instagram /> asm0dey
- <logos-facebook /> asm0dey

::right::

<img src="/news.png" class="invert rounded self-center"/>

---
layout: end
---
