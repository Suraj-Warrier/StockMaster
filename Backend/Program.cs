using System.Text;
using Backend.Models;
using Backend.Data;
using Backend.WebSockets;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var Configuration = builder.Configuration;

builder.Services.AddDbContext<ApplicationDBContext>(options => options.UseNpgsql(Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddIdentity<User, IdentityRole>().AddEntityFrameworkStores<ApplicationDBContext>().AddDefaultTokenProviders();
// var jwtSettings = Configuration.GetSection("JwtSettings");
// var key = Encoding.UTF8.GetBytes(jwtSettings["Secret"]);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    // options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
    
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["JwtSettings:Secret"])),
        ValidateLifetime = true,
        ValidateAudience = true,
        ValidateIssuer = true,
        ValidateIssuerSigningKey=true ,
        ValidIssuer = Configuration["JwtSettings:Issuer"],
        ValidAudience = Configuration["JwtSettings:Audience"]
    };

});

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddSingleton<StockWebSocketHandler>();
builder.Services.AddHostedService<StockScrapingService>();
builder.Services.AddHostedService<StockStorageService>();
builder.Services.AddControllers();
builder.Services.AddLogging();
builder.Services.AddTransient<EmailService>();
builder.Services.AddTransient<UserService>();

// Configure Npgsql to use dynamic JSON serialization
NpgsqlConnection.GlobalTypeMapper.EnableDynamicJson();

builder.Services.AddSwaggerGen(opt =>
{
    opt.SwaggerDoc("v1", new OpenApiInfo { Title = "MyAPI", Version = "v1" });
    opt.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });

    opt.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAllOrigins");

app.UseWebSockets();
app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();


//to activate the websocket handler when required
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/stocks")
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            var webSocketHandler = app.Services.GetRequiredService<StockWebSocketHandler>();
            var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            await webSocketHandler.HandleWebSocketAsync(context, webSocket);
        }
        else
        {
            context.Response.StatusCode = 400;
        }
    }
    else
    {
        await next();
    }
});

app.Run();
